const express = require('express');
const router = express.Router();
const {
  getAvailableTasks,
  acceptTask,
  getMyTasks,
  updateTaskStatus,
  getLeaderboard,
  updateVolunteerLocation,
  getTrackingInfo
} = require('../controllers/volunteerController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Volunteer-specific routes
router.get('/available-tasks', protect, authorize('volunteer'), getAvailableTasks);
router.post('/accept/:donationId', protect, authorize('volunteer'), acceptTask);
router.get('/my-tasks', protect, authorize('volunteer'), getMyTasks);
router.put('/update-status/:donationId', protect, authorize('volunteer'), updateTaskStatus);
router.put('/update-location/:donationId', protect, authorize('volunteer'), updateVolunteerLocation);
router.get('/track/:donationId', protect, getTrackingInfo);

// Public leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;
