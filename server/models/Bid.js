const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  bidTime: {
    type: Date,
    default: Date.now
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  isOutbid: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['active', 'outbid', 'won', 'cancelled'],
    default: 'active'
  },
  autoBid: {
    type: Boolean,
    default: false
  },
  maxAmount: {
    type: Number,
    min: 0
  },
  notes: String
}, {
  timestamps: true
});

// Indexes for better query performance
bidSchema.index({ auction: 1, bidTime: -1 });
bidSchema.index({ bidder: 1, bidTime: -1 });
bidSchema.index({ auction: 1, amount: -1 });
bidSchema.index({ status: 1 });

// Virtual for time since bid
bidSchema.virtual('timeSinceBid').get(function() {
  const now = new Date();
  return now - this.bidTime;
});

// Method to check if bid is valid
bidSchema.methods.isValid = function() {
  return this.status === 'active' && !this.isOutbid;
};

// Pre-save middleware to update auction current price
bidSchema.pre('save', async function(next) {
  if (this.isNew && this.amount > 0) {
    try {
      const Auction = mongoose.model('Auction');
      const auction = await Auction.findById(this.auction);
      
      if (auction && this.amount > auction.currentPrice) {
        auction.currentPrice = this.amount;
        auction.totalBids += 1;
        
        // Update unique bidders count
        const existingBids = await mongoose.model('Bid').find({
          auction: this.auction,
          bidder: { $ne: this.bidder }
        });
        
        if (existingBids.length === 0) {
          auction.uniqueBidders += 1;
        }
        
        await auction.save();
      }
    } catch (error) {
      console.error('Error updating auction price:', error);
    }
  }
  next();
});

// Ensure virtual fields are serialized
bidSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Bid', bidSchema);
