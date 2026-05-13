const z = require("zod");
const userService = require("./userService");
const catchAsync = require("../../utils/catchAsync");
const { supabase, supabaseAuth } = require("../../config/db");

const BUILD_VERSION = "v2-fix-20260512";

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

const generateReceiptRef = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SYN-${ts}-${rand}`;
};

exports.healthCheck = catchAsync(async (req, res) => {
  const { error } = await supabase.from("users").select("id").limit(1);
  if (error) throw error;
  res.json({ status: "ok", version: BUILD_VERSION, timestamp: new Date().toISOString() });
});

exports.serverLogin = catchAsync(async (req, res) => {
  const { identifier, password } = loginSchema.parse(req.body);

  let loginEmail = identifier;

  if (!identifier.includes('@')) {
    try {
      loginEmail = await userService.lookupEmail(identifier);
    } catch {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  }

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: loginEmail,
    password: password
  });

  if (error || !data.session) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const supabaseUserId = data.user.id;
  await supabase
    .from("users")
    .update({ auth_id: supabaseUserId })
    .eq("email", loginEmail);

  let profile = null;
  try {
    const { data: dbUser } = await supabase
      .from("users")
      .select("id, first_name, last_name, username, email, role, membership_status, membership_expires_at, created_at")
      .eq("email", loginEmail)
      .single();
    profile = dbUser;
  } catch {
    // non-blocking
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

exports.toggleMembership = catchAsync(async (req, res) => {
  const { status } = membershipSchema.parse(req.body);
  const reference = generateReceiptRef();

  const user = await userService.toggleMembership(req.user.id, status);

  const txType = status === 'member' ? 'membership_upgrade' : 'membership_downgrade';
  const amount = status === 'member' ? 499.00 : 0;
  await userService.recordTransaction(req.user.id, amount, txType, reference);

  res.json({ success: true, user, reference });
});

exports.cancelMembership = catchAsync(async (req, res) => {
  const reference = generateReceiptRef();
  const user = await userService.toggleMembership(req.user.id, 'free');

  await userService.recordTransaction(req.user.id, 0, 'membership_cancel', reference);

  res.json({ success: true, user, reference });
});