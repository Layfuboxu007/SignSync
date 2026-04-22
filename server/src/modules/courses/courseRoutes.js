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

module.exports = router;
