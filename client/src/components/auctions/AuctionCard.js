import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, DollarSign, User, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AuctionCard = ({ auction }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', color: 'success' },
      upcoming: { label: 'Upcoming', color: 'warning' },
      ended: { label: 'Ended', color: 'secondary' },
      draft: { label: 'Draft', color: 'secondary' },
      pending: { label: 'Pending', color: 'warning' },
      paused: { label: 'Paused', color: 'danger' }
    };

    const config = statusConfig[status] || { label: status, color: 'secondary' };
    return (
      <span className={`badge-${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endTime = new Date(auction.endTime);
    
    if (endTime <= now) {
      return 'Ended';
    }
    
    return formatDistanceToNow(endTime, { addSuffix: true });
  };

  const getPrimaryImage = () => {
    if (auction.images && auction.images.length > 0) {
      const primaryImage = auction.images.find(img => img.isPrimary) || auction.images[0];
      return primaryImage.url;
    }
    return `https://via.placeholder.com/300x200/3b82f6/ffffff?text=${encodeURIComponent(auction.title)}`;
  };

  return (
    <Link to={`/auction/${auction._id}`} className="block">
      <div className="card hover:shadow-large transition-shadow duration-300 group">
        {/* Image */}
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={getPrimaryImage()}
            alt={auction.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2">
            {getStatusBadge(auction.status)}
          </div>
        </div>

        {/* Content */}
        <div className="card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
            {auction.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {auction.description}
          </p>

          {/* Price and Time */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                <span className="text-sm">Current Price</span>
              </div>
              <span className="text-lg font-bold text-primary-600">
                ${auction.currentPrice?.toFixed(2) || auction.startingPrice?.toFixed(2)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="text-sm">Time Left</span>
              </div>
              <span className={`text-sm font-medium ${
                auction.status === 'ended' ? 'text-gray-500' : 'text-warning-600'
              }`}>
                {getTimeRemaining()}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{auction.seller?.username || 'Unknown'}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                <span>{auction.views || 0}</span>
              </div>
              
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>{auction.totalBids || 0} bids</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
