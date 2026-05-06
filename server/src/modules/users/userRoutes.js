const express = require("express");
const router = express.Router();
const userController = require("./userController");
const { authenticateToken } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/roleGuard");

// Public (no auth)
router.get("/health", userController.healthCheck);
router.post("/sync", userController.syncUser);

// Server-side username resolution (replaces the old /lookup-email).
// Resolves username → email internally and signs in via Supabase Auth.
// Returns session + profile on success, generic error on failure.
// This prevents username enumeration attacks.
router.post("/login", userController.serverLogin);

// Shared (all authenticated users)
router.get("/me", authenticateToken, userController.getMe);

// Student-only — admins should NOT delete themselves or toggle membership
router.delete("/", authenticateToken, requireRole("learner", "student"), userController.deleteMe);
router.post("/membership", authenticateToken, requireRole("learner", "student"), userController.toggleMembership);

module.exports = router;
