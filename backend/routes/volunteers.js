const express = require("express");
const Donation = require("../models/Donation");
const User = require("../models/User");
const { auth, volunteerAuth } = require("../middleware/auth");
const demoData = require("../config/demoData");

const router = express.Router();

// Get available tasks (pending donations)
router.get("/available-tasks", volunteerAuth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      return res.json(demoData.getPendingDonations());
    }

    const donations = await Donation.find({ status: "pending" })
      .populate("donor", "name phone email address")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error("Get available tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept task
router.post("/accept/:donationId", volunteerAuth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const donation = demoData.getDonationById(req.params.donationId);
      if (donation) {
        donation.status = "accepted";
        donation.volunteer = req.user;
        donation.acceptedAt = new Date();
      }
      return res.json(donation || { message: "Task accepted" });
    }

    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This donation has already been accepted" });
    }

    donation.volunteer = req.user._id;
    donation.status = "accepted";
    donation.acceptedAt = new Date();
    await donation.save();

    res.json(donation);
  } catch (error) {
    console.error("Accept task error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get my tasks (for volunteers)
router.get("/my-tasks", volunteerAuth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      return res.json(demoData.getDonationsByVolunteer(req.user._id));
    }

    const donations = await Donation.find({ volunteer: req.user._id })
      .populate("donor", "name phone email address")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error("Get my tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get donor details for a specific task
router.get("/donor-info/:donationId", volunteerAuth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const donation = demoData.getDonationById(req.params.donationId);
      if (donation) {
        return res.json({
          donor: donation.donor,
          donation: {
            title: donation.title,
            category: donation.category,
            status: donation.status,
            pickupAddress: donation.pickupAddress,
          },
        });
      }
      return res.status(404).json({ message: "Task not found" });
    }

    const donation = await Donation.findOne({
      _id: req.params.donationId,
      volunteer: req.user._id,
    }).populate("donor", "name phone email address createdAt");

    if (!donation) {
      return res
        .status(404)
        .json({ message: "Task not found or not assigned to you" });
    }

    res.json({
      donor: donation.donor,
      donation: {
        title: donation.title,
        category: donation.category,
        status: donation.status,
        pickupAddress: donation.pickupAddress,
      },
    });
  } catch (error) {
    console.error("Get donor info error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update task status
router.put("/update-status/:donationId", volunteerAuth, async (req, res) => {
  try {
    const { status } = req.body;

    // Demo mode
    if (!req.isMongoConnected) {
      const donation = demoData.getDonationById(req.params.donationId);
      if (donation) {
        donation.status = status;
      }
      return res.json(donation || { status });
    }

    const donation = await Donation.findOne({
      _id: req.params.donationId,
      volunteer: req.user._id,
    });

    if (!donation) {
      return res.status(404).json({ message: "Task not found" });
    }

    const validTransitions = {
      accepted: ["picked_up", "cancelled"],
      picked_up: ["in_transit", "cancelled"],
      in_transit: ["delivered", "cancelled"],
    };

    if (!validTransitions[donation.status]?.includes(status)) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    donation.status = status;

    if (status === "picked_up") {
      donation.pickedUpAt = new Date();
    } else if (status === "delivered") {
      donation.deliveredAt = new Date();
      // Award points to volunteer
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: 10, completedDeliveries: 1 },
      });
    }

    await donation.save();
    res.json(donation);
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update volunteer location
router.put("/update-location/:donationId", volunteerAuth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Demo mode
    if (!req.isMongoConnected) {
      return res.json({ message: "Location updated" });
    }

    const donation = await Donation.findOne({
      _id: req.params.donationId,
      volunteer: req.user._id,
    });

    if (!donation) {
      return res.status(404).json({ message: "Task not found" });
    }

    donation.volunteerLocation = {
      latitude,
      longitude,
      updatedAt: new Date(),
    };
    await donation.save();

    // Also update user's current location
    await User.findByIdAndUpdate(req.user._id, {
      currentLocation: { latitude, longitude },
    });

    res.json({ message: "Location updated" });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get tracking info for a donation
router.get("/track/:donationId", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const donation = demoData.getDonationById(req.params.donationId);
      return res.json({
        donation: donation || {},
        volunteerLocation: {
          latitude: 19.076,
          longitude: 72.8777,
          updatedAt: new Date(),
        },
      });
    }

    const donation = await Donation.findById(req.params.donationId)
      .populate("volunteer", "name phone")
      .populate("donor", "name");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Only allow donor or volunteer to track
    if (
      donation.donor._id.toString() !== req.user._id.toString() &&
      donation.volunteer?._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({
      donation,
      volunteerLocation: donation.volunteerLocation,
    });
  } catch (error) {
    console.error("Get tracking info error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get leaderboard
router.get("/leaderboard", async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      return res.json(demoData.demoLeaderboard);
    }

    const volunteers = await User.find({ role: "volunteer" })
      .select("name points completedDeliveries")
      .sort({ points: -1 })
      .limit(20);
    res.json(volunteers);
  } catch (error) {
    console.error("Get leaderboard error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
