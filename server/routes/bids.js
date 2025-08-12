const express = require('express');
const { body, validationResult } = require('express-validator');
const Bid = require('../models/Bid');
const Auction = require('../models/Auction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Place a bid
router.post('/', auth, [
  body('auctionId').isMongoId().withMessage('Valid auction ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Bid amount must be greater than 0')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { auctionId, amount } = req.body;

    // Check if auction exists and is active
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    if (!auction.canBid()) {
      return res.status(400).json({ error: 'Auction is not accepting bids' });
    }

    // Check if user is not bidding on their own auction
    if (auction.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot bid on your own auction' });
    }

    // Check if bid meets minimum requirements
    const minBid = auction.currentPrice + auction.minimumBidIncrement;
    if (amount < minBid) {
      return res.status(400).json({ 
        error: `Bid must be at least $${minBid.toFixed(2)}`,
        minBid
      });
    }

    // Create the bid
    const bid = new Bid({
      auction: auctionId,
      bidder: req.user._id,
      amount,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await bid.save();

    // Update auction current price
    auction.currentPrice = amount;
    auction.totalBids += 1;
    await auction.save();

    // Populate bidder info for response
    await bid.populate('bidder', 'username firstName lastName');

    res.status(201).json({
      message: 'Bid placed successfully',
      bid,
      newCurrentPrice: amount
    });

  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({ error: 'Server error placing bid' });
  }
});

// Get user's bids
router.get('/my-bids', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bids, total] = await Promise.all([
      Bid.find({ bidder: req.user._id })
        .populate('auction', 'title currentPrice endTime status')
        .sort({ bidTime: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Bid.countDocuments({ bidder: req.user._id })
    ]);

    res.json({
      bids,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });

  } catch (error) {
    console.error('Fetch user bids error:', error);
    res.status(500).json({ error: 'Server error fetching bids' });
  }
});

// Get winning bids for user
router.get('/winning', auth, async (req, res) => {
  try {
    const winningBids = await Bid.find({
      bidder: req.user._id,
      isWinning: true,
      status: 'active'
    })
    .populate('auction', 'title currentPrice endTime status')
    .sort({ bidTime: -1 })
    .lean();

    res.json({ winningBids });

  } catch (error) {
    console.error('Fetch winning bids error:', error);
    res.status(500).json({ error: 'Server error fetching winning bids' });
  }
});

// Cancel a bid (if auction hasn't started)
router.delete('/:id', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    if (bid.bidder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const auction = await Auction.findById(bid.auction);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // Can only cancel if auction hasn't started
    if (auction.startTime <= new Date()) {
      return res.status(400).json({ error: 'Cannot cancel bid on active auction' });
    }

    await bid.deleteOne();
    res.json({ message: 'Bid cancelled successfully' });

  } catch (error) {
    console.error('Cancel bid error:', error);
    res.status(500).json({ error: 'Server error cancelling bid' });
  }
});

module.exports = router;
