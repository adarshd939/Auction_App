import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { 
  Clock, 
  DollarSign, 
  User, 
  Gavel, 
  Heart, 
  Share2,
  Calendar,
  Tag,
  Eye,
  Users
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, joinAuction, leaveAuction, placeBid } = useSocket();
  
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    fetchAuctionDetails();
  }, [id]);

  useEffect(() => {
    if (socket && auction) {
      joinAuction(auction.id);
      
      socket.on('new_bid', handleNewBid);
      socket.on('auction_ended', handleAuctionEnded);
      
      return () => {
        leaveAuction(auction.id);
        socket.off('new_bid');
        socket.off('auction_ended');
      };
    }
  }, [socket, auction]);

  const fetchAuctionDetails = async () => {
    try {
      // In a real app, you'd fetch this data from your API
      // For now, we'll simulate the data
      const mockAuction = {
        id: parseInt(id),
        title: 'Vintage Watch Collection',
        description: 'A beautiful collection of vintage timepieces from the 1960s. This collection includes rare pieces from renowned watchmakers, each with its own unique history and craftsmanship. Perfect for collectors and enthusiasts alike.',
        category: 'Jewelry & Watches',
        startingPrice: 1000,
        currentPrice: 1250,
        minimumBidIncrement: 50,
        endTime: new Date(Date.now() + 86400000), // 24 hours from now
        status: 'active',
        seller: {
          id: 1,
          username: 'watchcollector',
          firstName: 'John',
          lastName: 'Smith',
          rating: 4.8
        },
        images: ['watch1.jpg', 'watch2.jpg', 'watch3.jpg'],
        totalBids: 12,
        createdAt: new Date(Date.now() - 604800000), // 7 days ago
        viewCount: 156
      };
      
      const mockBids = [
        {
          id: 1,
          bidder: { username: 'bidder1', firstName: 'Alice', lastName: 'Johnson' },
          amount: 1250,
          bidTime: new Date(Date.now() - 3600000), // 1 hour ago
          isWinning: true
        },
        {
          id: 2,
          bidder: { username: 'bidder2', firstName: 'Bob', lastName: 'Wilson' },
          amount: 1200,
          bidTime: new Date(Date.now() - 7200000), // 2 hours ago
          isWinning: false
        }
      ];
      
      setAuction(mockAuction);
      setBids(mockBids);
    } catch (error) {
      toast.error('Failed to load auction details');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewBid = (data) => {
    if (data.auctionId === auction.id) {
      setAuction(prev => ({
        ...prev,
        currentPrice: data.amount,
        totalBids: prev.totalBids + 1
      }));
      
      const newBid = {
        id: Date.now(),
        bidder: { username: data.bidder.username, firstName: data.bidder.firstName, lastName: data.bidder.lastName },
        amount: data.amount,
        bidTime: new Date(),
        isWinning: true
      };
      
      setBids(prev => [newBid, ...prev.map(bid => ({ ...bid, isWinning: false }))]);
      toast.success(`New bid: $${data.amount}`);
    }
  };

  const handleAuctionEnded = (data) => {
    if (data.auctionId === auction.id) {
      setAuction(prev => ({ ...prev, status: 'ended' }));
      toast.info('This auction has ended');
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to place a bid');
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= auction.currentPrice) {
      toast.error('Bid must be higher than current price');
      return;
    }

    if (amount < auction.currentPrice + auction.minimumBidIncrement) {
      toast.error(`Bid must be at least $${auction.minimumBidIncrement} higher than current price`);
      return;
    }

    setIsPlacingBid(true);

    try {
      await placeBid(auction.id, amount);
      setBidAmount('');
      toast.success('Bid placed successfully!');
    } catch (error) {
      toast.error('Failed to place bid');
    } finally {
      setIsPlacingBid(false);
    }
  };

  const getTimeRemaining = (endTime) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;

    if (diff <= 0) {
      return 'Ended';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Auction Not Found</h2>
          <p className="text-gray-600 mb-4">The auction you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><button onClick={() => navigate('/')} className="hover:text-primary-600">Home</button></li>
            <li>/</li>
            <li><button onClick={() => navigate(`/?category=${auction.category}`)} className="hover:text-primary-600">{auction.category}</button></li>
            <li>/</li>
            <li className="text-gray-900">{auction.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-4">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={auction.images[0] || '/placeholder.jpg'}
                    alt={auction.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
                {auction.images.length > 1 && (
                  <div className="mt-4 flex space-x-2 overflow-x-auto">
                    {auction.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${auction.title} ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">{auction.description}</p>
              </div>
            </div>

            {/* Bid History */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Bid History</h2>
              </div>
              <div className="p-6">
                {bids.length > 0 ? (
                  <div className="space-y-4">
                    {bids.map((bid) => (
                      <div key={bid.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {bid.bidder.firstName} {bid.bidder.lastName}
                            </p>
                            <p className="text-sm text-gray-600">@{bid.bidder.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-primary-600">
                            {formatCurrency(bid.amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {bid.bidTime.toLocaleString()}
                          </p>
                        </div>
                        {bid.isWinning && (
                          <div className="ml-4">
                            <span className="badge badge-success">Winning</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gavel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No bids yet. Be the first to bid!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Auction Info Card */}
            <div className="bg-white rounded-lg shadow mb-6 sticky top-8">
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{auction.title}</h1>
                
                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`badge ${
                    auction.status === 'active' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {auction.status === 'active' ? 'Active' : 'Ended'}
                  </span>
                </div>

                {/* Current Price */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {formatCurrency(auction.currentPrice)}
                  </p>
                </div>

                {/* Time Remaining */}
                {auction.status === 'active' && (
                  <div className="mb-6 p-4 bg-warning-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-warning-600 mr-2" />
                      <span className="text-warning-800 font-medium">
                        {getTimeRemaining(auction.endTime)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bid Form */}
                {auction.status === 'active' && (
                  <form onSubmit={handleBidSubmit} className="mb-6">
                    <div className="mb-4">
                      <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Bid
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="bidAmount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="input w-full pl-10"
                          placeholder={`Min: ${formatCurrency(auction.currentPrice + auction.minimumBidIncrement)}`}
                          min={auction.currentPrice + auction.minimumBidIncrement}
                          step="0.01"
                          required
                        />
                        <DollarSign className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum bid: {formatCurrency(auction.minimumBidIncrement)} above current price
                      </p>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isPlacingBid || !bidAmount}
                      className="btn btn-primary w-full flex items-center justify-center"
                    >
                      {isPlacingBid ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <Gavel className="h-5 w-5 mr-2" />
                          Place Bid
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => setIsWatching(!isWatching)}
                    className={`btn w-full flex items-center justify-center ${
                      isWatching ? 'btn-warning' : 'btn-secondary'
                    }`}
                  >
                    <Heart className={`h-5 w-5 mr-2 ${isWatching ? 'fill-current' : ''}`} />
                    {isWatching ? 'Watching' : 'Add to Watchlist'}
                  </button>
                  
                  <button className="btn btn-secondary w-full flex items-center justify-center">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share Auction
                  </button>
                </div>

                {/* Auction Details */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Starting Price</span>
                    <span className="text-sm font-medium">{formatCurrency(auction.startingPrice)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Bids</span>
                    <span className="text-sm font-medium">{auction.totalBids}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Views</span>
                    <span className="text-sm font-medium">{auction.viewCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-sm font-medium">{auction.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">End Date</span>
                    <span className="text-sm font-medium">
                      {auction.endTime.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Seller Information</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {auction.seller.firstName} {auction.seller.lastName}
                    </p>
                    <p className="text-sm text-gray-600">@{auction.seller.username}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">{auction.seller.rating}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < Math.floor(auction.seller.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button className="btn btn-secondary w-full">
                  View Seller Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
