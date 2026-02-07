const jwt = require("jsonwebtoken");
const User = require("../models/User");
const demoData = require("../config/demoData");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("🔐 Auth middleware:");
    console.log("   - Has token:", !!token);
    console.log("   - isMongoConnected:", req.isMongoConnected);

    if (!token) {
      console.log("   - REJECTED: No token");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Handle demo tokens from frontend (format: demo-token-{role}-{timestamp})
    if (token.startsWith("demo-token-")) {
      console.log("   - Detected frontend demo token");
      const tokenParts = token.split("-");
      // token parts: ["demo", "token", "role", "timestamp"]
      const role = tokenParts[2] || "donor";
      const timestamp = tokenParts[3] || Date.now();
      console.log("   - Demo token role:", role);
      const demoUser = {
        _id: "demo-user-" + timestamp,
        name: role.charAt(0).toUpperCase() + role.slice(1) + " User",
        email: role + "@demo.com",
        role: role,
        phone: "9876543210",
        address: "Demo Address, Mumbai",
      };
      req.user = demoUser;
      return next();
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "demo-secret");
    } catch (jwtError) {
      console.log("   - JWT verify failed, trying as demo mode");
      // If JWT verification fails and we're not connected to MongoDB, allow demo mode
      if (!req.isMongoConnected) {
        const demoUser = {
          _id: "demo-fallback-user",
          name: "Demo User",
          email: "demo@demo.com",
          role: "donor",
          phone: "9876543210",
          address: "Demo Address, Mumbai",
        };
        req.user = demoUser;
        return next();
      }
      throw jwtError;
    }

    console.log("   - Decoded userId:", decoded.userId);
    console.log("   - Is demo token:", decoded.demo);

    // Demo mode - use demo user data
    if (decoded.demo || !req.isMongoConnected) {
      console.log("   - Using DEMO user lookup");
      const demoUser = demoData.findUserById(decoded.userId) || {
        _id: decoded.userId,
        name: "Demo User",
        email: "demo@demo.com",
        role: "donor",
        phone: "9876543210",
        address: "Demo Address, Mumbai",
      };
      console.log("   - Found user:", demoUser._id, demoUser.name);
      req.user = demoUser;
      return next();
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("   - AUTH ERROR:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: "Authorization failed" });
  }
};

const volunteerAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "volunteer" && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Volunteer only." });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: "Authorization failed" });
  }
};

const organizationAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "organization" && req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Organization only." });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: "Authorization failed" });
  }
};

module.exports = { auth, adminAuth, volunteerAuth, organizationAuth };
