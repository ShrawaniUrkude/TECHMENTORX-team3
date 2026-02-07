const Donation = require('../models/Donation');
const User = require('../models/User');

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Donor only)
const createDonation = async (req, res) => {
  try {
    const { title, description, category, quantity, pickupAddress, city, pincode } = req.body;

    const donation = await Donation.create({
      donor: req.user._id,
      title,
      description,
      category,
      quantity,
      pickupAddress,
      city,
      pincode
    });

    // Increment donor's donation count
    await User.findByIdAndUpdate(req.user._id, { $inc: { donationsCreated: 1 } });

    const populatedDonation = await Donation.findById(donation._id).populate('donor', 'name email');
    res.status(201).json(populatedDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all donations for donor
// @route   GET /api/donations/my-donations
// @access  Private (Donor only)
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .populate('assignedVolunteer', 'name email phone')
      .sort({ createdAt: -1 });
    
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Private
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone')
      .populate('assignedVolunteer', 'name email phone');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update donation
// @route   PUT /api/donations/:id
// @access  Private (Donor only - their own donations)
const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user is the donor
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    // Don't allow update if already assigned
    if (donation.status !== 'CREATED') {
      return res.status(400).json({ message: 'Cannot update donation after it has been assigned' });
    }

    const { title, description, category, quantity, pickupAddress, city, pincode } = req.body;
    
    donation.title = title || donation.title;
    donation.description = description || donation.description;
    donation.category = category || donation.category;
    donation.quantity = quantity || donation.quantity;
    donation.pickupAddress = pickupAddress || donation.pickupAddress;
    donation.city = city || donation.city;
    donation.pincode = pincode || donation.pincode;

    const updatedDonation = await donation.save();
    res.json(updatedDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private (Donor only - their own donations)
const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check if user is the donor
    if (donation.donor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this donation' });
    }

    // Don't allow delete if already assigned
    if (donation.status !== 'CREATED') {
      return res.status(400).json({ message: 'Cannot delete donation after it has been assigned' });
    }

    await donation.deleteOne();
    res.json({ message: 'Donation removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createDonation,
  getMyDonations,
  getDonationById,
  updateDonation,
  deleteDonation
};
