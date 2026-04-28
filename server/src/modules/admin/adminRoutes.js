const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const { authenticateToken } = require('../../middleware/auth');

// Middleware to ensure user is an admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

// --- Telemetry Endpoints (Open to all authenticated users for logging) ---
// Note: We use authenticateToken so we know WHO generated the event
router.post('/track', authenticateToken, adminController.trackEvent);

// --- Admin Panel Endpoints (Protected by requireAdmin) ---
router.use(authenticateToken, requireAdmin);

router.get('/metrics/overview', adminController.getOverviewMetrics);
router.get('/metrics/engagement', adminController.getEngagementMetrics);
router.get('/users', adminController.getUsers);
router.get('/logs', adminController.getActivityLogs);

module.exports = router;
