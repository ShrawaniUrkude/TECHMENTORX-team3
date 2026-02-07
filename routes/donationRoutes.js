const express = require('express');
const router = express.Router();
const {
  createDonation,
  getMyDonations,
  getDonationById,
  updateDonation,
  deleteDonation
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Donor routes
router.post('/', protect, authorize('donor'), createDonation);
router.get('/my-donations', protect, authorize('donor'), getMyDonations);

// Common routes (accessible by donor and volunteer)
router.get('/:id', protect, getDonationById);

// Update and delete - donor only
router.put('/:id', protect, authorize('donor'), updateDonation);
router.delete('/:id', protect, authorize('donor'), deleteDonation);

module.exports = router;
