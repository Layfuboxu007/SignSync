const express = require("express");
const router = express.Router();
const { supabase } = require("../../config/db");
const { authenticateToken } = require("../../middleware/auth");

// =======================
// COURSES CRUD
// =======================

// CREATE COURSE
router.post("/", authenticateToken, async (req, res) => {
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
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// UPDATE COURSE
router.put("/:id", authenticateToken, async (req, res) => {
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
router.delete("/:id", authenticateToken, async (req, res) => {
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
// TASK 4: TRANSACTIONS & JOINS
// =======================

// POST /enroll (Purchase / Unlock Course)
// Demonstrates SQL Stored Procedure / Multi-table Atomic Transaction
router.post("/enroll", authenticateToken, async (req, res) => {
  const { course_id, amount } = req.body;
  if (!course_id || amount === undefined) {
    return res.status(400).json({ error: "Missing course_id or amount." });
  }

  // Calls the RPC (PostgreSQL Stored Procedure) bypassing conventional multiple awaits
  const { data, error } = await supabase.rpc("purchase_course", {
    p_user_id: req.user.id,
    p_course_id: course_id,
    p_amount: amount
  });

  if (error) return res.status(500).json({ error: "Transaction failed: " + error.message });
  res.json({ success: true, message: "Course unlocked and transaction verified!" });
});

// GET /my-enrollments (View owned courses)
// Demonstrates JOINS by retrieving enrollments with their linked course data via Foreign Key
router.get("/my-enrollments", authenticateToken, async (req, res) => {
  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      status,
      created_at,
      course_id,
      courses (*)
    `)
    .eq("user_id", req.user.id);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;
