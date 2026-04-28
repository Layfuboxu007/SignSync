const express = require("express");
const router = express.Router();
const courseController = require("./courseController");
const { authenticateToken } = require("../../middleware/auth");

// COURSES CRUD
router.post("/", authenticateToken, courseController.createCourse);
router.get("/", courseController.getAllCourses);
router.put("/:id", authenticateToken, courseController.updateCourse);
router.delete("/:id", authenticateToken, courseController.deleteCourse);

// ENROLLMENTS & PROGRESS
router.post("/:id/enroll", authenticateToken, courseController.enrollUser);
router.get("/my-enrollments", authenticateToken, courseController.getMyEnrollments);
router.post("/:id/progress", authenticateToken, courseController.recordProgress);

module.exports = router;
