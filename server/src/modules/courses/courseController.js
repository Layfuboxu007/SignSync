const z = require("zod");
const courseService = require("./courseService");

const courseSchema = z.object({
  title: z.string().min(1),
  gestures: z.any().optional(),
  mastery_score: z.number().optional()
});

exports.createCourse = async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res.status(403).json({ error: "Only instructors can create courses." });
    }
    const courseData = courseSchema.parse(req.body);
    const course = await courseService.createCourse(courseData, req.user.id);
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res.status(403).json({ error: "Only instructors can edit courses." });
    }
    const courseData = courseSchema.parse(req.body);
    const course = await courseService.updateCourse(req.params.id, courseData, req.user.id);
    res.json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    if (req.user.role !== "instructor") {
      return res.status(403).json({ error: "Only instructors can delete courses." });
    }
    await courseService.deleteCourse(req.params.id, req.user.id);
    res.json({ message: "Course deleted successfully!" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.enrollUser = async (req, res) => {
  try {
    const enrollment = await courseService.enrollUser(req.user, req.params.id);
    res.status(201).json({ success: true, message: "Successfully enrolled!", enrollment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await courseService.getMyEnrollments(req.user.id);
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.recordProgress = async (req, res) => {
  try {
    const { module_name } = req.body;
    if (!module_name) return res.status(400).json({ error: "module_name is required" });
    
    await courseService.recordProgress(req.user.id, req.params.id, module_name);
    res.status(200).json({ success: true, message: "Progress recorded" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
