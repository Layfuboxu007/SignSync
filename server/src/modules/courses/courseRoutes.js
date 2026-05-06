const express = require("express");
const router = express.Router();
const courseController = require("./courseController");
const { authenticateToken } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/roleGuard");
const { verifyEnrollment } = require("../../middleware/verifyEnrollment");

// COURSES CRUD (instructor-only for write operations)
router.post("/", authenticateToken, requireRole("instructor"), courseController.createCourse);
router.get("/", courseController.getAllCourses);
router.put("/:id", authenticateToken, requireRole("instructor"), courseController.updateCourse);
router.delete("/:id", authenticateToken, requireRole("instructor"), courseController.deleteCourse);

// ACCESS VERIFICATION (re-checks membership on Practice Room entry)
router.get("/:id/verify-access", authenticateToken, verifyEnrollment, (req, res) => {
  res.json({ access: true });
});

// ENROLLMENTS & PROGRESS (student-only — admin must NOT pollute data)
router.post("/:id/enroll", authenticateToken, requireRole("learner", "student"), courseController.enrollUser);
router.get("/my-enrollments", authenticateToken, courseController.getMyEnrollments);
router.post("/:id/progress", authenticateToken, requireRole("learner", "student"), courseController.recordProgress);

module.exports = router;
