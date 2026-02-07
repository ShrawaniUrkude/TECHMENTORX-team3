const express = require("express");
const { auth } = require("../middleware/auth");
const demoData = require("../config/demoData");

const router = express.Router();

// Demo messages storage
let demoMessages = [
  {
    _id: "msg-1",
    from: { _id: "demo-donor-1", name: "John Donor", role: "donor" },
    to: { _id: "demo-org-1", name: "Hope Foundation", role: "organization" },
    content: "I have 50kg of rice to donate. When can you pick up?",
    read: false,
    createdAt: new Date("2026-02-06T10:30:00"),
  },
  {
    _id: "msg-2",
    from: {
      _id: "demo-volunteer-1",
      name: "Jane Volunteer",
      role: "volunteer",
    },
    to: { _id: "demo-org-1", name: "Hope Foundation", role: "organization" },
    content: "I completed the delivery at Andheri. Attached are the photos.",
    read: true,
    createdAt: new Date("2026-02-05T15:45:00"),
  },
  {
    _id: "msg-3",
    from: { _id: "demo-org-1", name: "Hope Foundation", role: "organization" },
    to: { _id: "demo-donor-1", name: "John Donor", role: "donor" },
    content:
      "Thank you for your generous donation! We will pick it up tomorrow.",
    read: true,
    createdAt: new Date("2026-02-05T09:00:00"),
  },
];

// Send a message
router.post("/", auth, async (req, res) => {
  try {
    const { recipientId, content } = req.body;

    if (!content || !recipientId) {
      return res
        .status(400)
        .json({ message: "Recipient and content are required" });
    }

    // Demo mode
    if (!req.isMongoConnected) {
      const recipient = demoData.findUserById(recipientId) || {
        _id: recipientId,
        name: "Demo User",
        role: "donor",
      };

      const newMessage = {
        _id: `msg-${Date.now()}`,
        from: {
          _id: req.user._id,
          name: req.user.name,
          role: req.user.role,
        },
        to: {
          _id: recipient._id,
          name: recipient.name,
          role: recipient.role,
        },
        content,
        read: false,
        createdAt: new Date(),
      };

      demoMessages.push(newMessage);
      return res.status(201).json(newMessage);
    }

    // MongoDB mode would go here
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all messages for current user
router.get("/", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const userMessages = demoMessages.filter(
        (m) => m.to._id === req.user._id || m.from._id === req.user._id,
      );
      // Sort by date, newest first
      userMessages.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      return res.json(userMessages);
    }

    res.json([]);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get conversation with specific user
router.get("/conversation/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Demo mode
    if (!req.isMongoConnected) {
      const conversation = demoMessages.filter(
        (m) =>
          (m.from._id === req.user._id && m.to._id === userId) ||
          (m.from._id === userId && m.to._id === req.user._id),
      );
      conversation.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      return res.json(conversation);
    }

    res.json([]);
  } catch (error) {
    console.error("Get conversation error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark message as read
router.put("/:messageId/read", auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    // Demo mode
    if (!req.isMongoConnected) {
      const message = demoMessages.find((m) => m._id === messageId);
      if (message) {
        message.read = true;
      }
      return res.json({ success: true });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread count
router.get("/unread-count", auth, async (req, res) => {
  try {
    // Demo mode
    if (!req.isMongoConnected) {
      const unreadCount = demoMessages.filter(
        (m) => m.to._id === req.user._id && !m.read,
      ).length;
      return res.json({ count: unreadCount });
    }

    res.json({ count: 0 });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
