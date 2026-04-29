const z = require("zod");
const userService = require("./userService");
const catchAsync = require("../../utils/catchAsync");

// Validation schemas
const lookupSchema = z.object({
  username: z.string().min(1)
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

exports.testDb = catchAsync(async (req, res) => {
  const data = await userService.testDbConnection();
  res.json(data);
});

exports.lookupEmail = catchAsync(async (req, res) => {
  const { username } = lookupSchema.parse(req.body);
  const email = await userService.lookupEmail(username);
  res.json({ email });
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
  const user = await userService.toggleMembership(req.user.id, status);
  res.json({ success: true, user });
});
