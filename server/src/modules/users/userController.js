const z = require("zod");
const userService = require("./userService");

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

exports.testDb = async (req, res) => {
  try {
    const data = await userService.testDbConnection();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.lookupEmail = async (req, res) => {
  try {
    const { username } = lookupSchema.parse(req.body);
    const email = await userService.lookupEmail(username);
    res.json({ email });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.syncUser = async (req, res) => {
  try {
    const userData = syncUserSchema.parse(req.body);
    await userService.syncUser(userData);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    await userService.deleteUser(req.user.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.toggleMembership = async (req, res) => {
  try {
    const { status } = membershipSchema.parse(req.body);
    const user = await userService.toggleMembership(req.user.id, status);
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
