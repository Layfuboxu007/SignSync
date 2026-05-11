const z = require("zod");
const userService = require("./userService");
const catchAsync = require("../../utils/catchAsync");
const { supabase } = require("../../config/db");

const BUILD_VERSION = "v2-fix-20260512";

// Validation schemas
const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1)
});

const syncUserSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string().email(),
  role: z.string()
});

const membershipSchema = z.object({
  status: z.enum(["free", "member"])
});

/**
 * Generate a mock receipt reference for transaction auditing.
 * Format: SYN-{timestamp}-{random4}
 */
const generateReceiptRef = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SYN-${ts}-${rand}`;
};

/**
 * GET /health — lightweight DB connectivity check.
 * Returns { status: "ok" } without dumping user data.
 */
exports.healthCheck = catchAsync(async (req, res) => {
  const { error } = await supabase.from("users").select("id").limit(1);
  if (error) throw error;
  res.json({ status: "ok", version: BUILD_VERSION, timestamp: new Date().toISOString() });
});

/**
 * POST /login — server-side username/email resolution + Supabase Auth sign-in.
 * Accepts { identifier, password } where identifier is either a username or email.
 * Resolves username → email server-side so the client never queries it directly.
 * Returns a generic "Invalid credentials" on any failure to prevent enumeration.
 */
exports.serverLogin = catchAsync(async (req, res) => {
  const { identifier, password } = loginSchema.parse(req.body);

  let loginEmail = identifier;

  // If it's not an email, resolve the username server-side
  if (!identifier.includes('@')) {
    try {
      loginEmail = await userService.lookupEmail(identifier);
    } catch {
      // Generic error — don't reveal whether the username exists
      return res.status(401).json({ error: "Invalid credentials" });
    }
  }

  // Sign in via Supabase Auth using the admin client
  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: password
  });

  if (error || !data.session) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Fetch the profile from our public users table
  let profile = null;
  try {
    const { data: dbUser } = await supabase
      .from("users")
      .select("id, first_name, last_name, username, email, role, membership_status, membership_expires_at, created_at")
      .eq("email", loginEmail)
      .single();
    profile = dbUser;
  } catch {
    // Profile fetch failed but auth succeeded — non-blocking
  }

  res.json({
    session: data.session,
    profile,
    role: profile?.role || "student"
  });
});

exports.syncUser = catchAsync(async (req, res) => {
  const userData = syncUserSchema.parse(req.body);
  await userService.syncUser(userData);
  res.json({ success: true });
});

exports.getMe = catchAsync(async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);
  res.json(user);
});

exports.deleteMe = catchAsync(async (req, res) => {
  await userService.deleteUser(req.user.id);
  res.json({ message: "User deleted successfully" });
});

/**
 * POST /users/membership — Upgrade or change membership status.
 * Records a transaction in the audit log with a mock receipt reference.
 */
exports.toggleMembership = catchAsync(async (req, res) => {
  const { status } = membershipSchema.parse(req.body);
  const reference = generateReceiptRef();

  const user = await userService.toggleMembership(req.user.id, status);

  // Record transaction for audit trail
  const txType = status === 'member' ? 'membership_upgrade' : 'membership_downgrade';
  const amount = status === 'member' ? 499.00 : 0;
  await userService.recordTransaction(req.user.id, amount, txType, reference);

  res.json({ success: true, user, reference });
});

/**
 * POST /users/cancel-membership — Self-service membership cancellation.
 * Downgrades the user to 'free' and records the cancellation.
 */
exports.cancelMembership = catchAsync(async (req, res) => {
  const reference = generateReceiptRef();
  const user = await userService.toggleMembership(req.user.id, 'free');

  await userService.recordTransaction(req.user.id, 0, 'membership_cancel', reference);

  res.json({ success: true, user, reference });
});
