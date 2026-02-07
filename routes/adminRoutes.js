const express = require('express');
const router = express.Router();
const {
  getAllDonations,
  getAllVolunteers,
  getAllDonors,
  getStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Admin-only routes
router.get('/donations', protect, authorize('admin'), getAllDonations);
router.get('/volunteers', protect, authorize('admin'), getAllVolunteers);
router.get('/donors', protect, authorize('admin'), getAllDonors);
router.get('/stats', protect, authorize('admin'), getStats);

module.exports = router;
