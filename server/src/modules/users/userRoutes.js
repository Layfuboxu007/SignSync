const express = require("express");
const router = express.Router();
const userController = require("./userController");
const { authenticateToken } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/roleGuard");

// Public (no auth)
router.get("/health", userController.healthCheck);
router.post("/sync", userController.syncUser);

// Temporary diagnostic endpoint — remove after debugging
router.get("/diag", async (req, res) => {
  const { supabase } = require("../../config/db");
  const checks = {};
  try {
    const email = req.query.email || "jandeeeb@gmail.com";
    
    // Check if user exists by email
    const { data: byEmail, error: e1 } = await supabase.from('users').select('id, email, username, role, membership_status').eq('email', email).maybeSingle();
    checks.user_by_email = byEmail || (e1 ? `ERR: ${e1.message}` : 'NOT FOUND');

    // Check if username 'jandib' exists
    const { data: byUsername, error: e2 } = await supabase.from('users').select('id, email, username').eq('username', 'jandib').maybeSingle();
    checks.user_by_username_jandib = byUsername || (e2 ? `ERR: ${e2.message}` : 'NOT FOUND');

    // List all users (limited)
    const { data: allUsers, error: e3 } = await supabase.from('users').select('id, email, username, role').limit(20);
    checks.all_users = allUsers || (e3 ? `ERR: ${e3.message}` : []);
    checks.total_users = allUsers ? allUsers.length : 0;

    checks.deploy_time = new Date().toISOString();
    res.json({ success: true, checks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, checks });
  }
});

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
router.post("/cancel-membership", authenticateToken, requireRole("learner", "student"), userController.cancelMembership);

module.exports = router;
