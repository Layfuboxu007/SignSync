const express = require("express");
const router = express.Router();
const userController = require("./userController");
const { authenticateToken } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/roleGuard");

// Public (no auth)
router.get("/test-db", userController.testDb);
router.post("/lookup-email", userController.lookupEmail);
router.post("/sync-user", userController.syncUser);

// Shared (all authenticated users)
router.get("/user/me", authenticateToken, userController.getMe);

// Student-only — admins should NOT delete themselves or toggle membership
router.delete("/user", authenticateToken, requireRole("learner", "student"), userController.deleteMe);
router.post("/user/membership", authenticateToken, requireRole("learner", "student"), userController.toggleMembership);

module.exports = router;
