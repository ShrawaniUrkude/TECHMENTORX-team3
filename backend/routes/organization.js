const express = require("express");
const { auth, organizationAuth } = require("../middleware/auth");
const demoData = require("../config/demoData");

const router = express.Router();

// Demo campaigns storage
let demoCampaigns = [
  {
    _id: "camp-1",
    organization: "demo-org-1",
    name: "Winter Warmth Drive",
    status: "active",
    target: 500,
    collected: 320,
    type: "clothes",
    endDate: "2026-03-15",
    createdAt: new Date("2026-01-15"),
  },
  {
    _id: "camp-2",
    organization: "demo-org-1",
    name: "Food for All",
    status: "active",
    target: 1000,
    collected: 750,
    type: "food",
    endDate: "2026-02-28",
    createdAt: new Date("2026-01-01"),
  },
];

// Get organization's campaigns
router.get("/campaigns", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const campaigns = demoCampaigns.filter(
        (c) =>
          c.organization === req.user._id || req.user.role === "organization",
      );
      return res.json(campaigns);
    }

    res.json([]);
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create campaign
router.post("/campaigns", auth, async (req, res) => {
  try {
    const { name, type, target, endDate } = req.body;

    // Demo mode
    if (!req.isMongoConnected) {
      const newCampaign = {
        _id: `camp-${Date.now()}`,
        organization: req.user._id,
        name,
        type,
        target: parseInt(target),
        collected: 0,
        status: "active",
        endDate,
        createdAt: new Date(),
      };
      demoCampaigns.push(newCampaign);
      return res.status(201).json(newCampaign);
    }

    res.status(201).json({ message: "Campaign created" });
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update campaign
router.put("/campaigns/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Demo mode
    if (!req.isMongoConnected) {
      const campaign = demoCampaigns.find((c) => c._id === id);
      if (campaign) {
        Object.assign(campaign, req.body);
      }
      return res.json(campaign);
    }

    res.json({ message: "Campaign updated" });
  } catch (error) {
    console.error("Update campaign error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get organization's volunteers
router.get("/volunteers", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const volunteers = demoData.demoUsers.filter(
        (u) => u.role === "volunteer",
      );
      return res.json(
        volunteers.map((v) => ({
          _id: v._id,
          name: v.name,
          phone: v.phone,
          status: "active",
          completedDeliveries: v.completedDeliveries || 0,
          rating: 4.5,
        })),
      );
    }

    res.json([]);
  } catch (error) {
    console.error("Get volunteers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get incoming donations
router.get("/donations", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const donations = demoData.demoDonations.map((d) => ({
        _id: d._id,
        donor: d.donor.name,
        donorId: d.donor._id,
        title: d.title,
        description: d.description,
        category: d.category,
        quantity: d.quantity,
        status: d.status,
        createdAt: d.createdAt,
      }));
      return res.json(donations);
    }

    res.json([]);
  } catch (error) {
    console.error("Get donations error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept a donation
router.post("/donations/:id/accept", auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Demo mode
    if (!req.isMongoConnected) {
      const donation = demoData.demoDonations.find((d) => d._id === id);
      if (donation) {
        donation.status = "accepted";
      }
      return res.json({ success: true, message: "Donation accepted" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Accept donation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get organization stats
router.get("/stats", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      return res.json({
        totalCampaigns: demoCampaigns.length,
        activeCampaigns: demoCampaigns.filter((c) => c.status === "active")
          .length,
        totalDonations: demoData.demoDonations.length,
        totalVolunteers: demoData.demoUsers.filter(
          (u) => u.role === "volunteer",
        ).length,
      });
    }

    res.json({
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalDonations: 0,
      totalVolunteers: 0,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
