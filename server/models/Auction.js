const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Art', 'Antiques', 'Jewelry', 'Vehicles', 'Real Estate', 'Collectibles', 'Sports', 'Books', 'Other']
  },
  startingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  reservePrice: {
    type: Number,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  minimumBidIncrement: {
    type: Number,
    required: true,
    min: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'paused', 'ended', 'cancelled'],
    default: 'draft'
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: Boolean
  }],
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  totalBids: {
    type: Number,
    default: 0
  },
  uniqueBidders: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  watchers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [String],
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Excellent', 'Good', 'Fair', 'Poor'],
    required: true
  },
  shippingInfo: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingCost: Number,
    freeShipping: {
      type: Boolean,
      default: false
    }
  },
  paymentMethods: [{
    type: String,
    enum: ['Credit Card', 'PayPal', 'Bank Transfer', 'Cash']
  }],
  autoExtend: {
    type: Boolean,
    default: true
  },
  autoExtendMinutes: {
    type: Number,
    default: 5
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date,
  moderationNotes: String,
  isApproved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ category: 1, status: 1 });
auctionSchema.index({ seller: 1 });
auctionSchema.index({ startTime: 1, endTime: 1 });
auctionSchema.index({ featured: 1, status: 1 });

// Virtual for time remaining
auctionSchema.virtual('timeRemaining').get(function() {
  if (this.status !== 'active') return 0;
  const now = new Date();
  const remaining = this.endTime - now;
  return remaining > 0 ? remaining : 0;
});

// Virtual for is active
auctionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startTime && now <= this.endTime;
});

// Virtual for is ended
auctionSchema.virtual('isEnded').get(function() {
  const now = new Date();
  return this.status === 'ended' || now > this.endTime;
});

// Method to check if auction can be bid on
auctionSchema.methods.canBid = function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.startTime && 
         now <= this.endTime;
};

// Method to get auction status
auctionSchema.methods.getStatus = function() {
  const now = new Date();
  
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'draft') return 'draft';
  if (this.status === 'pending') return 'pending';
  if (this.status === 'paused') return 'paused';
  
  if (now < this.startTime) return 'upcoming';
  if (now > this.endTime) return 'ended';
  return 'active';
};

// Pre-save middleware to set current price
auctionSchema.pre('save', function(next) {
  if (this.isNew) {
    this.currentPrice = this.startingPrice;
  }
  next();
});

// Ensure virtual fields are serialized
auctionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Auction', auctionSchema);
