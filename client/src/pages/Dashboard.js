import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Gavel, 
  Clock, 
  TrendingUp, 
  Eye, 
  DollarSign,
  Calendar,
  Award,
  Heart
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    activeAuctions: 0,
    totalBids: 0,
    wonAuctions: 0,
    watchlistCount: 0
  });
  const [recentAuctions, setRecentAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new_bid', handleNewBid);
      socket.on('auction_won', handleAuctionWon);
      
      return () => {
        socket.off('new_bid');
        socket.off('auction_won');
      };
    }
  }, [socket]);

  const fetchDashboardData = async () => {
    try {
      // In a real app, you'd fetch this data from your API
      // For now, we'll simulate the data
      setStats({
        activeAuctions: 5,
        totalBids: 23,
        wonAuctions: 3,
        watchlistCount: 8
      });
      
      setRecentAuctions([
        {
          id: 1,
          title: 'Vintage Watch Collection',
          currentPrice: 1250,
          endTime: new Date(Date.now() + 86400000), // 24 hours from now
          status: 'active',
          totalBids: 12
        },
        {
          id: 2,
          title: 'Antique Furniture Set',
          currentPrice: 3200,
          endTime: new Date(Date.now() + 172800000), // 48 hours from now
          status: 'active',
          totalBids: 8
        }
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewBid = (data) => {
    toast.success(`New bid placed on ${data.auctionTitle}: $${data.amount}`);
    fetchDashboardData(); // Refresh data
  };

  const handleAuctionWon = (data) => {
    toast.success(`Congratulations! You won ${data.auctionTitle} for $${data.amount}`);
    fetchDashboardData(); // Refresh data
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Gavel className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Auctions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeAuctions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bids</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalBids}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <Award className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Won Auctions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.wonAuctions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Heart className="h-6 w-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Watchlist</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.watchlistCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/create-auction"
                className="flex items-center justify-center p-4 border-2 border-dashed border-primary-300 rounded-lg hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <Plus className="h-6 w-6 text-primary-600 mr-2" />
                <span className="text-primary-600 font-medium">Create Auction</span>
              </Link>
              
              <Link
                to="/my-auctions"
                className="flex items-center justify-center p-4 border-2 border-dashed border-secondary-300 rounded-lg hover:border-secondary-400 hover:bg-secondary-50 transition-colors"
              >
                <Gavel className="h-6 w-6 text-secondary-600 mr-2" />
                <span className="text-secondary-600 font-medium">My Auctions</span>
              </Link>
              
              <Link
                to="/profile"
                className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-6 w-6 text-gray-600 mr-2" />
                <span className="text-gray-600 font-medium">View Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-6">
            {recentAuctions.length > 0 ? (
              <div className="space-y-4">
                {recentAuctions.map((auction) => (
                  <div key={auction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{auction.title}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>Current: ${auction.currentPrice}</span>
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{auction.totalBids} bids</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        <Calendar className="h-4 w-4 inline mr-1" />
                        Ends: {auction.endTime.toLocaleDateString()}
                      </div>
                      <div className="mt-1">
                        <span className={`badge ${auction.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                          {auction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent activity</p>
                <Link to="/" className="text-primary-600 hover:text-primary-500 mt-2 inline-block">
                  Browse auctions
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
