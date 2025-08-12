import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Gavel, 
  Clock, 
  Eye, 
  Edit, 
  Trash2,
  DollarSign,
  Calendar,
  Users,
  Tag
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MyAuctions = () => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    try {
      // In a real app, you'd fetch this data from your API
      // For now, we'll simulate the data
      const mockAuctions = [
        {
          id: 1,
          title: 'Vintage Watch Collection',
          description: 'A beautiful collection of vintage timepieces from the 1960s',
          category: 'Jewelry & Watches',
          startingPrice: 1000,
          currentPrice: 1250,
          endTime: new Date(Date.now() + 86400000), // 24 hours from now
          status: 'active',
          totalBids: 12,
          images: ['watch1.jpg', 'watch2.jpg'],
          createdAt: new Date(Date.now() - 86400000) // 24 hours ago
        },
        {
          id: 2,
          title: 'Antique Furniture Set',
          description: 'Elegant antique furniture set from the Victorian era',
          category: 'Furniture & Home',
          startingPrice: 2500,
          currentPrice: 3200,
          endTime: new Date(Date.now() + 172800000), // 48 hours from now
          status: 'active',
          totalBids: 8,
          images: ['furniture1.jpg'],
          createdAt: new Date(Date.now() - 172800000) // 48 hours ago
        },
        {
          id: 3,
          title: 'Rare Coin Collection',
          description: 'Collection of rare coins from various historical periods',
          category: 'Art & Collectibles',
          startingPrice: 500,
          currentPrice: 500,
          endTime: new Date(Date.now() - 3600000), // 1 hour ago
          status: 'ended',
          totalBids: 0,
          images: ['coin1.jpg', 'coin2.jpg'],
          createdAt: new Date(Date.now() - 604800000) // 7 days ago
        }
      ];
      
      setAuctions(mockAuctions);
    } catch (error) {
      toast.error('Failed to load auctions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId) => {
    if (!window.confirm('Are you sure you want to delete this auction?')) {
      return;
    }

    try {
      // In a real app, you'd call your API to delete the auction
      setAuctions(prev => prev.filter(auction => auction.id !== auctionId));
      toast.success('Auction deleted successfully');
    } catch (error) {
      toast.error('Failed to delete auction');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'ended':
        return <span className="badge badge-warning">Ended</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge badge-secondary">{status}</span>;
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

  const filteredAuctions = auctions.filter(auction => {
    if (filter === 'all') return true;
    return auction.status === filter;
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Auctions</h1>
            <p className="text-gray-600">Manage your auctions and track their performance</p>
          </div>
          <Link
            to="/create-auction"
            className="btn btn-primary mt-4 sm:mt-0 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Auction
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'ended', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auctions List */}
        {filteredAuctions.length > 0 ? (
          <div className="grid gap-6">
            {filteredAuctions.map((auction) => (
              <div key={auction.id} className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {auction.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {auction.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-1" />
                              {auction.category}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              Current: ${auction.currentPrice}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {auction.totalBids} bids
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Created: {auction.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col items-end space-y-2">
                          {getStatusBadge(auction.status)}
                          {auction.status === 'active' && (
                            <div className="text-sm text-gray-600 text-right">
                              <Clock className="h-4 w-4 inline mr-1" />
                              {getTimeRemaining(auction.endTime)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
                    <Link
                      to={`/auction/${auction.id}`}
                      className="btn btn-secondary flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                    
                    {auction.status === 'active' && (
                      <>
                        <Link
                          to={`/edit-auction/${auction.id}`}
                          className="btn btn-warning flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteAuction(auction.id)}
                          className="btn btn-danger flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gavel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't created any auctions yet."
                : `No ${filter} auctions found.`
              }
            </p>
            <Link
              to="/create-auction"
              className="btn btn-primary flex items-center mx-auto"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Auction
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAuctions;
