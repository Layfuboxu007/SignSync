const express = require("express");
const router = express.Router();
const courseController = require("./courseController");
const { authenticateToken } = require("../../middleware/auth");
const { requireRole } = require("../../middleware/roleGuard");

// COURSES CRUD (instructor-only for write operations)
router.post("/", authenticateToken, requireRole("instructor"), courseController.createCourse);
router.get("/", courseController.getAllCourses);
router.put("/:id", authenticateToken, requireRole("instructor"), courseController.updateCourse);
router.delete("/:id", authenticateToken, requireRole("instructor"), courseController.deleteCourse);

// ENROLLMENTS & PROGRESS (student-only — admin must NOT pollute data)
router.post("/:id/enroll", authenticateToken, requireRole("learner", "student"), courseController.enrollUser);
router.get("/my-enrollments", authenticateToken, requireRole("learner", "student"), courseController.getMyEnrollments);
router.post("/:id/progress", authenticateToken, requireRole("learner", "student"), courseController.recordProgress);

module.exports = router;
