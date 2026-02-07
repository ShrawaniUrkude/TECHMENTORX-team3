const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const demoData = require("../config/demoData");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Demo mode check
    if (!req.isMongoConnected) {
      const token = jwt.sign(
        { userId: "demo-user-new", demo: true },
        process.env.JWT_SECRET || "demo-secret",
        {
          expiresIn: "7d",
        },
      );
      return res.status(201).json({
        token,
        user: {
          id: "demo-user-new",
          name: name,
          email: email,
          role: role || "donor",
        },
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      role: role || "donor",
      phone,
      address,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Demo mode check
    if (!req.isMongoConnected) {
      const demoUser = demoData.findUserByEmail(email);
      if (demoUser || email.includes("@")) {
        const user = demoUser || {
          _id: "demo-user",
          name: email.split("@")[0],
          email,
          role: "donor",
        };
        const token = jwt.sign(
          { userId: user._id, demo: true },
          process.env.JWT_SECRET || "demo-secret",
          {
            expiresIn: "7d",
          },
        );
        return res.json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get profile
router.get("/profile", auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
