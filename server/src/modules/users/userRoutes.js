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
    // Check users table columns
    const { data: u, error: ue } = await supabase.from('users').select('id, membership_status').limit(1);
    checks.users_base = ue ? `ERR: ${ue.message}` : 'OK';

    const { data: u2, error: ue2 } = await supabase.from('users').select('id, membership_expires_at').limit(1);
    checks.users_expires_at = ue2 ? `ERR: ${ue2.message}` : 'OK';

    // Check transactions table
    const { data: t, error: te } = await supabase.from('transactions').select('id').limit(1);
    checks.transactions_base = te ? `ERR: ${te.message}` : 'OK';

    const { data: t2, error: te2 } = await supabase.from('transactions').select('id, transaction_type, reference').limit(1);
    checks.transactions_audit = te2 ? `ERR: ${te2.message}` : 'OK';

    // Check Zod
    const z = require("zod");
    checks.zod_import = typeof z.object === 'function' ? 'OK' : `FAIL: z.object is ${typeof z.object}`;

    checks.deploy_time = new Date().toISOString();
    res.json({ success: true, checks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, stack: err.stack, checks });
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
