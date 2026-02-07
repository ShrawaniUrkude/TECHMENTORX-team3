const express = require("express");
const Donation = require("../models/Donation");
const { auth } = require("../middleware/auth");
const demoData = require("../config/demoData");

const router = express.Router();

// Create donation
router.post("/", auth, async (req, res) => {
  try {
    console.log("📦 Create donation request received");
    console.log("   - isMongoConnected:", req.isMongoConnected);
    console.log("   - user:", req.user?._id);
    console.log("   - body:", JSON.stringify(req.body));

    // Demo mode
    if (!req.isMongoConnected) {
      console.log("   - Using DEMO MODE");
      const newDonation = demoData.addDonation({
        ...req.body,
        donor: req.user,
      });
      console.log("   - Created donation:", newDonation._id);
      return res.status(201).json(newDonation);
    }

    const donation = new Donation({
      ...req.body,
      donor: req.user._id,
    });
    await donation.save();
    res.status(201).json(donation);
  } catch (error) {
    console.error("Create donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get my donations (for donors)
router.get("/my-donations", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const donations = demoData.getDonationsByDonor(req.user._id);
      return res.json(donations);
    }

    const donations = await Donation.find({ donor: req.user._id })
      .populate("volunteer", "name phone")
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get donation by ID
router.get("/:id", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const donation = demoData.getDonationById(req.params.id);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      return res.json(donation);
    }

    const donation = await Donation.findById(req.params.id)
      .populate("donor", "name phone address")
      .populate("volunteer", "name phone");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    res.json(donation);
  } catch (error) {
    console.error("Get donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update donation
router.put("/:id", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const donation = demoData.getDonationById(req.params.id);
      if (!donation) {
        return res.status(404).json({ message: "Donation not found" });
      }
      Object.assign(donation, req.body);
      return res.json(donation);
    }

    const donation = await Donation.findOne({
      _id: req.params.id,
      donor: req.user._id,
    });

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot update donation after it has been accepted" });
    }

    Object.assign(donation, req.body);
    await donation.save();
    res.json(donation);
  } catch (error) {
    console.error("Update donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete donation
router.delete("/:id", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      return res.json({ message: "Donation deleted" });
    }

    const donation = await Donation.findOne({
      _id: req.params.id,
      donor: req.user._id,
    });

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    if (donation.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot delete donation after it has been accepted" });
    }

    await donation.deleteOne();
    res.json({ message: "Donation deleted" });
  } catch (error) {
    console.error("Delete donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
