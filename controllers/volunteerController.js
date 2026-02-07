const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Get available donations (location-based matching)
// @route   GET /api/volunteers/available-tasks
// @access  Private (Volunteer only)
const getAvailableTasks = async (req, res) => {
  try {
    const volunteer = req.user;
    
    // Find donations in same city or pincode that are not yet assigned
    const query = {
      status: 'CREATED',
      $or: []
    };

    // Match by city or pincode
    if (volunteer.city) {
      query.$or.push({ city: volunteer.city });
    }
    if (volunteer.pincode) {
      query.$or.push({ pincode: volunteer.pincode });
    }

    // If no location data, show all available
    if (query.$or.length === 0) {
      delete query.$or;
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name phone city pincode')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Accept a donation task
// @route   POST /api/volunteers/accept/:donationId
// @access  Private (Volunteer only)
const acceptTask = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.status !== 'CREATED') {
      return res.status(400).json({ message: 'This donation is no longer available' });
    }

    // Assign volunteer
    donation.assignedVolunteer = req.user._id;
    donation.status = 'ASSIGNED';
    donation.assignedAt = new Date();

    await donation.save();

    const updatedDonation = await Donation.findById(donation._id)
      .populate('donor', 'name phone city pincode');

    res.json(updatedDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get volunteer's assigned tasks
// @route   GET /api/volunteers/my-tasks
// @access  Private (Volunteer only)
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Donation.find({ assignedVolunteer: req.user._id })
      .populate('donor', 'name phone city pincode pickupAddress')
      .sort({ assignedAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update donation status (volunteer workflow)
// @route   PUT /api/volunteers/update-status/:donationId
// @access  Private (Volunteer only)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body; // PICKED_UP or DELIVERED
    console.log('Update status request:', { donationId: req.params.donationId, status, volunteerId: req.user._id });
    
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      console.log('Donation not found:', req.params.donationId);
      return res.status(404).json({ message: 'Donation not found' });
    }

    console.log('Donation found:', { id: donation._id, status: donation.status, assignedVolunteer: donation.assignedVolunteer });

    // Check if volunteer is assigned to this donation
    if (!donation.assignedVolunteer) {
      console.log('No volunteer assigned to this donation');
      return res.status(400).json({ message: 'No volunteer assigned to this donation' });
    }

    if (donation.assignedVolunteer.toString() !== req.user._id.toString()) {
      console.log('Volunteer not authorized:', { assigned: donation.assignedVolunteer, requesting: req.user._id });
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    // Validate status transition
    if (status === 'PICKED_UP' && donation.status === 'ASSIGNED') {
      donation.status = 'PICKED_UP';
      donation.pickedUpAt = new Date();
      console.log('Updating to PICKED_UP');
    } else if (status === 'DELIVERED' && donation.status === 'PICKED_UP') {
      donation.status = 'DELIVERED';
      donation.deliveredAt = new Date();
      console.log('Updating to DELIVERED, awarding points:', donation.pointsAwarded);
      
      // Award points to volunteer
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: donation.pointsAwarded, tasksCompleted: 1 }
      });
    } else {
      console.log('Invalid status transition:', { currentStatus: donation.status, requestedStatus: status });
      return res.status(400).json({ 
        message: 'Invalid status transition',
        currentStatus: donation.status,
        requestedStatus: status
      });
    }

    await donation.save();
    console.log('Status updated successfully');
    res.json(donation);
  } catch (error) {
    console.error('Error in updateTaskStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get leaderboard (top volunteers by points)
// @route   GET /api/volunteers/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const volunteers = await User.find({ role: 'volunteer' })
      .select('name points tasksCompleted city')
      .sort({ points: -1 })
      .limit(20);

    res.json(volunteers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update volunteer location during delivery
// @route   PUT /api/volunteers/update-location/:donationId
// @access  Private (Volunteer only)
const updateVolunteerLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if volunteer is assigned
    if (!donation.assignedVolunteer || donation.assignedVolunteer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update volunteer location on donation
    donation.volunteerLocation = {
      latitude,
      longitude,
      lastUpdated: new Date()
    };

    await donation.save();

    // Also update user's current location
    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: {
        latitude,
        longitude,
        lastUpdated: new Date()
      }
    });

    res.json({ message: 'Location updated', location: donation.volunteerLocation });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get donation with live tracking info
// @route   GET /api/volunteers/track/:donationId
// @access  Private
const getTrackingInfo = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId)
      .populate('donor', 'name phone')
      .populate('assignedVolunteer', 'name phone currentLocation');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json({
      donation: {
        id: donation._id,
        title: donation.title,
        status: donation.status,
        pickupAddress: donation.pickupAddress,
        pickupLocation: donation.pickupLocation,
        volunteerLocation: donation.volunteerLocation
      },
      donor: donation.donor,
      volunteer: donation.assignedVolunteer
    });
  } catch (error) {
    console.error('Error getting tracking info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAvailableTasks,
  acceptTask,
  getMyTasks,
  updateTaskStatus,
  getLeaderboard,
  updateVolunteerLocation,
  getTrackingInfo
};
