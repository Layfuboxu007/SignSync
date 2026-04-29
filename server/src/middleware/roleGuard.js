/**
 * Centralized Role-Based Access Control (RBAC) Middleware
 * 
 * Usage:
 *   const { requireRole } = require("../../middleware/roleGuard");
 *   router.get("/admin-only", authenticateToken, requireRole("admin"), handler);
 *   router.post("/students-only", authenticateToken, requireRole("learner", "student"), handler);
 */

const VALID_ROLES = ["learner", "student", "instructor", "admin"];

const requireRole = (...allowedRoles) => {
  // Validate at startup so typos are caught immediately
  for (const role of allowedRoles) {
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`[roleGuard] Invalid role "${role}". Valid roles: ${VALID_ROLES.join(", ")}`);
    }
  }

  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Requires one of [${allowedRoles.join(", ")}]`
      });
    }
    next();
  };
};

module.exports = { requireRole, VALID_ROLES };
