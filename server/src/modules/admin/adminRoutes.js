const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const { authenticateToken } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/roleGuard');

// --- Telemetry Endpoints (Open to all authenticated users for logging) ---
// Note: We use authenticateToken so we know WHO generated the event
router.post('/track', authenticateToken, adminController.trackEvent);
router.post('/track/batch', authenticateToken, adminController.trackBatchEvents);

// --- Admin Panel Endpoints (Protected by centralized requireRole) ---
router.use(authenticateToken, requireRole('admin'));

router.get('/metrics/overview', adminController.getOverviewMetrics);
router.get('/metrics/engagement', adminController.getEngagementMetrics);
router.get('/users', adminController.getUsers);
router.get('/logs', adminController.getActivityLogs);
router.get('/transactions', adminController.getTransactions);

module.exports = router;
