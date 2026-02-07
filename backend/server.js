const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const donationRoutes = require("./routes/donations");
const volunteerRoutes = require("./routes/volunteers");
const adminRoutes = require("./routes/admin");
const messageRoutes = require("./routes/messages");
const organizationRoutes = require("./routes/organization");

const app = express();

// Track MongoDB connection status - start in demo mode, set true only when connected
let isMongoConnected = false;

// Middleware
app.use(cors());
app.use(express.json());

// Make connection status available to routes
app.use((req, res, next) => {
  req.isMongoConnected = isMongoConnected;
  next();
});

// Connect to MongoDB with short timeout
mongoose.set("bufferCommands", false);
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/social-mentor",
    {
      serverSelectionTimeoutMS: 3000, // 3 second timeout
    },
  )
  .then(() => {
    console.log("Connected to MongoDB");
    isMongoConnected = true;
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("🎭 Running in DEMO MODE - using mock data");
    isMongoConnected = false;
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/organization", organizationRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongoConnected: isMongoConnected,
    mode: isMongoConnected ? "database" : "demo",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
