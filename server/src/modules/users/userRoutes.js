const express = require("express");
const router = express.Router();
const { supabase } = require("../../config/db");
const { authenticateToken } = require("../../middleware/auth");

// TEST DB CONNECTION
router.get("/test-db", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) return res.json(error);
  res.json(data);
});

// =======================
// RLS BYPASS ENDPOINTS
// =======================

router.post("/lookup-email", async (req, res) => {
  const { username } = req.body;
  const { data, error } = await supabase.from("users").select("email").eq("username", username).single();
  if (error || !data) return res.status(404).json({ error: "Username not found" });
  res.json({ email: data.email });
});

router.post("/sync-user", async (req, res) => {
  const { firstName, lastName, username, email, role } = req.body;
  const { error } = await supabase.from("users").insert({
     first_name: firstName,
     last_name: lastName,
     username: username,
     role: role,
     email: email,
     password_hash: "supabase-auth"
  });
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// READ USER
router.get("/user/me", authenticateToken, async (req, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, username, email, role, created_at")
    .eq("id", req.user.id)
    .single();

  if (error || !user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// DELETE USER
router.delete("/user", authenticateToken, async (req, res) => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  
  res.json({ message: "User deleted successfully" });
});

module.exports = router;
