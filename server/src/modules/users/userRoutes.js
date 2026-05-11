const express = require("express");
const router = express.Router();
const userController = require("./userController");
const { authenticateToken } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/roleGuard");

// Public (no auth)
router.get("/health", userController.healthCheck);
router.post("/sync", userController.syncUser);

// Temporary debug endpoint — tests auth middleware query
router.get("/debug-auth/:email", async (req, res) => {
  const { supabase } = require("../../config/db");
  const email = decodeURIComponent(req.params.email);
  const results = {};

  // Step 1: exact same query as auth middleware
  const { data: d1, error: e1 } = await supabase.from('users').select('id, role, membership_status, membership_expires_at').eq('email', email).single();
  results.step1_single = { data: d1, error: e1 ? { code: e1.code, message: e1.message } : null };

  // Step 2: try without membership_expires_at
  const { data: d2, error: e2 } = await supabase.from('users').select('id, role, membership_status').eq('email', email).single();
  results.step2_without_expires = { data: d2, error: e2 ? { code: e2.code, message: e2.message } : null };

  // Step 3: try with maybeSingle
  const { data: d3, error: e3 } = await supabase.from('users').select('id, role, membership_status, membership_expires_at').eq('email', email).maybeSingle();
  results.step3_maybeSingle = { data: d3, error: e3 ? { code: e3.code, message: e3.message } : null };

  // Step 4: list all emails
  const { data: d4 } = await supabase.from('users').select('id, email').limit(20);
  results.all_emails = d4;

  res.json(results);
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
