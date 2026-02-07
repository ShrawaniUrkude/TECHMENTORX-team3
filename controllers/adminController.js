const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Get all donations (admin view)
// @route   GET /api/admin/donations
// @access  Private (Admin only)
const getAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email phone city')
      .populate('assignedVolunteer', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all volunteers (admin view)
// @route   GET /api/admin/volunteers
// @access  Private (Admin only)
const getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' })
      .select('-password')
      .sort({ points: -1 });

    res.json(volunteers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all donors (admin view)
// @route   GET /api/admin/donors
// @access  Private (Admin only)
const getAllDonors = async (req, res) => {
  try {
    const donors = await User.find({ role: 'donor' })
      .select('-password')
      .sort({ donationsCreated: -1 });

    res.json(donors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getStats = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalDonors = await User.countDocuments({ role: 'donor' });
    
    const donationsByStatus = await Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const stats = {
      totalDonations,
      totalVolunteers,
      totalDonors,
      donationsByStatus
    };

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllDonations,
  getAllVolunteers,
  getAllDonors,
  getStats
};
