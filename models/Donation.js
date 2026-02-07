const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    enum: ['food', 'clothes', 'books', 'electronics', 'furniture', 'other'],
    default: 'other'
  },
  quantity: {
    type: String,
    required: true
  },
  // Location details
  pickupAddress: {
    type: String,
    required: [true, 'Pickup address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true
  },
  // Coordinates for tracking
  pickupLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  volunteerLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
    lastUpdated: { type: Date }
  },
  // Status workflow
  status: {
    type: String,
    enum: ['CREATED', 'ASSIGNED', 'PICKED_UP', 'DELIVERED'],
    default: 'CREATED'
  },
  // Volunteer assignment
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: {
    type: Date
  },
  pickedUpAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  // Points awarded to volunteer
  pointsAwarded: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);
