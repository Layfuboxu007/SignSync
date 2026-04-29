const express = require("express");
const router = express.Router();
const userController = require("./userController");
const { authenticateToken } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/roleGuard");

// Public (no auth)
router.get("/test-db", userController.testDb);
router.post("/lookup-email", userController.lookupEmail);
router.post("/sync", userController.syncUser);

// Shared (all authenticated users)
router.get("/me", authenticateToken, userController.getMe);

// Student-only — admins should NOT delete themselves or toggle membership
router.delete("/", authenticateToken, requireRole("learner", "student"), userController.deleteMe);
router.post("/membership", authenticateToken, requireRole("learner", "student"), userController.toggleMembership);

module.exports = router;
