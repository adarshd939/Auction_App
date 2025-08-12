const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const { auth, optionalAuth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all auctions with filtering and pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, category, status, search } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [auctions, total] = await Promise.all([
      Auction.find(filter)
        .populate('seller', 'username firstName lastName rating')
        .sort({ endTime: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Auction.countDocuments(filter)
    ]);

    res.json({
      auctions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching auctions' });
  }
});

// Get auction by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('seller', 'username firstName lastName rating')
      .populate('winner', 'username firstName lastName')
      .lean();

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    const recentBids = await Bid.find({ auction: req.params.id })
      .populate('bidder', 'username firstName lastName')
      .sort({ bidTime: -1 })
      .limit(10)
      .lean();

    res.json({ auction, recentBids });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching auction' });
  }
});

// Create new auction
router.post('/', auth, [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('description').trim().isLength({ min: 20, max: 2000 }),
  body('category').isIn(['Electronics', 'Art', 'Antiques', 'Jewelry', 'Vehicles', 'Real Estate', 'Collectibles', 'Sports', 'Books', 'Other']),
  body('startingPrice').isFloat({ min: 0 }),
  body('startTime').isISO8601(),
  body('endTime').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const auction = new Auction({
      ...req.body,
      seller: req.user._id,
      status: 'pending'
    });

    await auction.save();
    res.status(201).json({ message: 'Auction created successfully', auction });
  } catch (error) {
    res.status(500).json({ error: 'Server error creating auction' });
  }
});

// Update auction
router.put('/:id', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction || auction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ message: 'Auction updated successfully', auction: updatedAuction });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating auction' });
  }
});

// Delete auction
router.delete('/:id', auth, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction || auction.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await auction.deleteOne();
    res.json({ message: 'Auction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting auction' });
  }
});

module.exports = router;
