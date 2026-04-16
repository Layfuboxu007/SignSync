require("dotenv").config();
// IMPORTS
const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// APP SETUP
const app = express();
app.use(cors());
app.use(express.json());


// DATABASE 

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// MIDDLEWARE
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied" });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(403).json({ error: "Invalid token" });
  }

  // Fetch the numeric ID from the public users table so relations like 'instructor_id' do not break
  const { data: dbUser } = await supabase.from('users').select('id, role').eq('email', user.email).single();

  req.user = {
    id: dbUser ? dbUser.id : user.id,
    email: user.email,
    role: dbUser ? dbUser.role : (user.user_metadata?.role || "learner")
  };
  next();
};

// =======================
// ROUTES
// =======================

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Server is working!");
});

// TEST DB CONNECTION
app.get("/test-db", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) return res.json(error);
  res.json(data);
});

// =======================
// RLS BYPASS ENDPOINTS
// =======================

app.post("/lookup-email", async (req, res) => {
  const { username } = req.body;
  const { data, error } = await supabase.from("users").select("email").eq("username", username).single();
  if (error || !data) return res.status(404).json({ error: "Username not found" });
  res.json({ email: data.email });
});

app.post("/sync-user", async (req, res) => {
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
app.get("/user/me", authenticateToken, async (req, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, username, email, role, created_at")
    .eq("id", req.user.id)
    .single();

  if (error || !user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// (Update user endpoint delegated to Supabase Auth on Frontend)

// DELETE USER
app.delete("/user", authenticateToken, async (req, res) => {
  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  
  res.json({ message: "User deleted successfully" });
});

// =======================
// COURSES CRUD
// =======================

// CREATE COURSE
app.post("/courses", authenticateToken, async (req, res) => {
  if (req.user.role !== "instructor") return res.status(403).json({ error: "Only instructors can create courses." });
  
  const { title, gestures, mastery_score } = req.body;
  if (!title || !gestures) return res.status(400).json({ error: "Title and gestures are required." });

  const { data, error } = await supabase
    .from("courses")
    .insert([{ instructor_id: req.user.id, title, gestures, mastery_score }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// READ ALL COURSES
app.get("/courses", async (req, res) => {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// UPDATE COURSE
app.put("/courses/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "instructor") return res.status(403).json({ error: "Only instructors can edit courses." });
  
  const { title, gestures, mastery_score } = req.body;
  
  const { data, error } = await supabase
    .from("courses")
    .update({ title, gestures, mastery_score })
    .eq("id", req.params.id)
    .eq("instructor_id", req.user.id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  if (data.length === 0) return res.status(404).json({ error: "Course not found or unauthorized." });
  res.json(data[0]);
});

// DELETE COURSE
app.delete("/courses/:id", authenticateToken, async (req, res) => {
  if (req.user.role !== "instructor") return res.status(403).json({ error: "Only instructors can delete courses." });

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", req.params.id)
    .eq("instructor_id", req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: "Course deleted successfully!" });
});

// =======================
// START SERVER
// =======================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});