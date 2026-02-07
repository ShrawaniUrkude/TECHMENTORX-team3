const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ["food", "clothes", "electronics", "furniture", "books", "other"],
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  pickupLocation: {
    latitude: Number,
    longitude: Number,
  },
  deliveryAddress: {
    type: String,
  },
  deliveryLocation: {
    latitude: Number,
    longitude: Number,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "picked_up",
      "in_transit",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  volunteerLocation: {
    latitude: Number,
    longitude: Number,
    updatedAt: Date,
  },
  images: [
    {
      type: String,
    },
  ],
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
});

module.exports = mongoose.model("Donation", donationSchema);
