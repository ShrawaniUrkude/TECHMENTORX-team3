const express = require("express");
const Donation = require("../models/Donation");
const User = require("../models/User");
const { adminAuth } = require("../middleware/auth");
const demoData = require("../config/demoData");

const router = express.Router();

// Get all donations
router.get("/donations", adminAuth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      return res.json(demoData.demoDonations);
    }

    const donations = await Donation.find()
      .populate("donor", "name email phone")
      .populate("volunteer", "name email phone")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error("Get all donations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all volunteers
router.get("/volunteers", adminAuth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      return res.json(demoData.demoUsers.filter((u) => u.role === "volunteer"));
    }

    const volunteers = await User.find({ role: "volunteer" })
      .select("-password")
      .sort({ points: -1 });
    res.json(volunteers);
  } catch (error) {
    console.error("Get volunteers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all donors
router.get("/donors", adminAuth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      return res.json(demoData.demoUsers.filter((u) => u.role === "donor"));
    }

    const donors = await User.find({ role: "donor" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(donors);
  } catch (error) {
    console.error("Get donors error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get stats
router.get("/stats", adminAuth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      return res.json({
        totalDonations: 25,
        pendingDonations: 8,
        completedDonations: 12,
        inProgressDonations: 5,
        totalVolunteers: 15,
        totalDonors: 42,
        donationsByCategory: [
          { _id: "food", count: 10 },
          { _id: "clothes", count: 8 },
          { _id: "books", count: 5 },
          { _id: "electronics", count: 2 },
        ],
        recentDonations: demoData.demoDonations.slice(0, 5),
      });
    }

    const [
      totalDonations,
      pendingDonations,
      completedDonations,
      totalVolunteers,
      totalDonors,
    ] = await Promise.all([
      Donation.countDocuments(),
      Donation.countDocuments({ status: "pending" }),
      Donation.countDocuments({ status: "delivered" }),
      User.countDocuments({ role: "volunteer" }),
      User.countDocuments({ role: "donor" }),
    ]);

    // Get donations by category
    const donationsByCategory = await Donation.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Get recent activity
    const recentDonations = await Donation.find()
      .populate("donor", "name")
      .populate("volunteer", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalDonations,
      pendingDonations,
      completedDonations,
      inProgressDonations:
        totalDonations - pendingDonations - completedDonations,
      totalVolunteers,
      totalDonors,
      donationsByCategory,
      recentDonations,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
