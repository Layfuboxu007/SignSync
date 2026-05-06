const { supabase } = require('../config/db');

/**
 * Middleware to verify a user still has valid access to a course.
 * Checks enrollment status AND membership tier for Advanced courses.
 * Use on Practice Room entry to prevent membership bypass.
 */
const verifyEnrollment = async (req, res, next) => {
  const courseId = req.params.id || req.body.courseId;
  if (!courseId) return res.status(400).json({ access: false, reason: "Course ID required" });

  try {
    // Check enrollment exists
    const { data: enrollment, error: enrError } = await supabase
      .from('enrollments')
      .select('status')
      .eq('user_id', req.user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (enrError || !enrollment) {
      return res.status(403).json({ access: false, reason: "You are not enrolled in this course." });
    }

    // Check course difficulty tier
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('difficulty')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ access: false, reason: "Course not found." });
    }

    const freeTiers = ['beginner', 'intermediate'];
    const isFreeCourse = freeTiers.includes((course.difficulty || '').toLowerCase());

    if (!isFreeCourse && req.user.membership_status !== 'member') {
      return res.status(403).json({ 
        access: false, 
        reason: "This is an advanced course. Your membership has expired. Please renew to continue." 
      });
    }

    // Access granted
    req.course = course;
    req.enrollment = enrollment;
    next();
  } catch (err) {
    return res.status(500).json({ access: false, reason: "Access verification failed." });
  }
};

module.exports = { verifyEnrollment };
