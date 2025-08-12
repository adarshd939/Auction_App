const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

const setupSocketHandlers = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Join user to their personal room
    socket.join(`user_${socket.user._id}`);

    // Handle joining auction room
    socket.on('join_auction', (auctionId) => {
      socket.join(`auction_${auctionId}`);
      console.log(`User ${socket.user.username} joined auction ${auctionId}`);
    });

    // Handle leaving auction room
    socket.on('leave_auction', (auctionId) => {
      socket.leave(`auction_${auctionId}`);
      console.log(`User ${socket.user.username} left auction ${auctionId}`);
    });

    // Handle new bid
    socket.on('place_bid', async (data) => {
      try {
        const { auctionId, amount } = data;

        // Validate auction
        const auction = await Auction.findById(auctionId);
        if (!auction) {
          socket.emit('bid_error', { error: 'Auction not found' });
          return;
        }

        if (!auction.canBid()) {
          socket.emit('bid_error', { error: 'Auction is not accepting bids' });
          return;
        }

        // Check if user is not bidding on their own auction
        if (auction.seller.toString() === socket.user._id.toString()) {
          socket.emit('bid_error', { error: 'Cannot bid on your own auction' });
          return;
        }

        // Check minimum bid
        const minBid = auction.currentPrice + auction.minimumBidIncrement;
        if (amount < minBid) {
          socket.emit('bid_error', { 
            error: `Bid must be at least $${minBid.toFixed(2)}`,
            minBid
          });
          return;
        }

        // Create bid
        const bid = new Bid({
          auction: auctionId,
          bidder: socket.user._id,
          amount,
          ipAddress: socket.handshake.address,
          userAgent: socket.handshake.headers['user-agent']
        });

        await bid.save();

        // Update auction
        auction.currentPrice = amount;
        auction.totalBids += 1;
        await auction.save();

        // Populate bidder info
        await bid.populate('bidder', 'username firstName lastName');

        // Broadcast to all users in the auction room
        io.to(`auction_${auctionId}`).emit('new_bid', {
          bid,
          newCurrentPrice: amount,
          auctionId
        });

        // Notify previous highest bidder if different user
        if (auction.currentPrice > amount) {
          const previousBids = await Bid.find({
            auction: auctionId,
            amount: { $lt: amount }
          }).populate('bidder', '_id');

          previousBids.forEach(async (prevBid) => {
            if (prevBid.bidder._id.toString() !== socket.user._id.toString()) {
              // Mark previous bid as outbid
              prevBid.isOutbid = true;
              prevBid.status = 'outbid';
              await prevBid.save();

              // Notify user they've been outbid
              io.to(`user_${prevBid.bidder._id}`).emit('outbid', {
                auctionId,
                auctionTitle: auction.title,
                newPrice: amount,
                bidder: socket.user.username
              });
            }
          });
        }

        // Emit success to the bidder
        socket.emit('bid_success', {
          message: 'Bid placed successfully',
          bid,
          newCurrentPrice: amount
        });

      } catch (error) {
        console.error('Socket bid error:', error);
        socket.emit('bid_error', { error: 'Server error placing bid' });
      }
    });

    // Handle auction status updates
    socket.on('auction_status_update', async (auctionId) => {
      try {
        const auction = await Auction.findById(auctionId);
        if (!auction) return;

        const now = new Date();
        const status = auction.getStatus();

        // Check if auction has ended
        if (status === 'ended' && auction.status !== 'ended') {
          auction.status = 'ended';
          
          // Find winner
          const winningBid = await Bid.findOne({
            auction: auctionId,
            amount: auction.currentPrice
          }).sort({ bidTime: 1 });

          if (winningBid) {
            auction.winner = winningBid.bidder;
            winningBid.isWinning = true;
            winningBid.status = 'won';
            await winningBid.save();

            // Notify winner
            io.to(`user_${winningBid.bidder}`).emit('auction_won', {
              auctionId,
              auctionTitle: auction.title,
              winningAmount: auction.currentPrice
            });
          }

          await auction.save();

          // Broadcast auction ended
          io.to(`auction_${auctionId}`).emit('auction_ended', {
            auctionId,
            winner: auction.winner,
            finalPrice: auction.currentPrice
          });
        }

        // Broadcast status update
        io.to(`auction_${auctionId}`).emit('auction_status_changed', {
          auctionId,
          status,
          timeRemaining: auction.timeRemaining
        });

      } catch (error) {
        console.error('Auction status update error:', error);
      }
    });

    // Handle user typing in chat (if implementing chat feature)
    socket.on('typing', (auctionId) => {
      socket.to(`auction_${auctionId}`).emit('user_typing', {
        username: socket.user.username,
        auctionId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.username} disconnected`);
    });
  });

  // Set up auction monitoring (check every 30 seconds)
  setInterval(async () => {
    try {
      const activeAuctions = await Auction.find({
        status: 'active',
        endTime: { $lte: new Date() }
      });

      activeAuctions.forEach(async (auction) => {
        // Emit to all connected clients
        io.emit('auction_ended', {
          auctionId: auction._id,
          title: auction.title,
          finalPrice: auction.currentPrice
        });
      });
    } catch (error) {
      console.error('Auction monitoring error:', error);
    }
  }, 30000);

  return io;
};

module.exports = { setupSocketHandlers };
