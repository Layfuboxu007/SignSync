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
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access denied" });
  
  jwt.verify(token, process.env.JWT_SECRET || "secretkey", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
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

// REGISTER
app.post("/register", async (req, res) => {
  const { firstName, lastName, username, email, password, role } = req.body;

  // Server-Side Verification
  if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address format." });
  }
  if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters long, and contain at least 1 uppercase letter and 1 number." });
  }
  if (!username) {
    return res.status(400).json({ error: "Username is an absolutely required field." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from("users")
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          role: role || 'learner',
          username,
          email,
          password_hash: hashedPassword,
        },
      ]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Both username and password are required to login." });
  }

  const isEmail = username.includes("@");
  
  const query = supabase.from("users").select("*");
  if (isEmail) {
    query.eq("email", username);
  } else {
    query.eq("username", username);
  }

  const { data: user, error } = await query.single();

  if (error || !user) {
    return res.status(400).json({ error: "User not found" });
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(400).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "secretkey", {
    expiresIn: "1h",
  });

  res.json({ token });
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

// UPDATE USER
app.put("/user", authenticateToken, async (req, res) => {
  const { email, password, newPassword } = req.body;

  let updates = {};
  
  if (email) {
    updates.email = email;
  }
  
  if (password && newPassword) {
    const { data: currentUser, error: userError } = await supabase
      .from("users")
      .select("password_hash")
      .eq("id", req.user.id)
      .single();
      
    if (userError || !currentUser) return res.status(404).json({ error: "User not found" });
    
    const valid = await bcrypt.compare(password, currentUser.password_hash);
    if (!valid) return res.status(400).json({ error: "Invalid current password" });
    
    updates.password_hash = await bcrypt.hash(newPassword, 10);
  }
  
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", req.user.id);

  if (error) return res.status(400).json({ error: error.message });
  
  res.json({ message: "User updated successfully" });
});

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