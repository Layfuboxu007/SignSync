const { supabase } = require("../../config/db");

// Helper: resolve UUID to bigint id
const resolveUserId = async (authId) => {
  if (!authId) return null;
  if (!isNaN(authId)) return parseInt(authId);

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .maybeSingle();

  return data ? data.id : null;
};

exports.createCourse = async (courseData, instructorId) => {
  const realInstructorId = await resolveUserId(instructorId);

  const { data, error } = await supabase
    .from("courses")
    .insert([{ instructor_id: realInstructorId, ...courseData }])
    .select();
  if (error) throw error;
  return data[0];
};

exports.getAllCourses = async () => {
  const { data, error } = await supabase.from("courses").select("*");
  if (error) throw error;
  return data;
};

exports.updateCourse = async (courseId, courseData, instructorId) => {
  const realInstructorId = await resolveUserId(instructorId);

  const { data, error } = await supabase
    .from("courses")
    .update(courseData)
    .eq("id", courseId)
    .eq("instructor_id", realInstructorId)
    .select();
  if (error) throw error;
  if (data.length === 0) throw new Error("Course not found or unauthorized");
  return data[0];
};

exports.deleteCourse = async (courseId, instructorId) => {
  const realInstructorId = await resolveUserId(instructorId);

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)
    .eq("instructor_id", realInstructorId);
  if (error) throw error;
  return true;
};

exports.enrollUser = async (user, courseId) => {
  const realUserId = await resolveUserId(user.id);

  // Fetch the course to check its difficulty tier
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("difficulty")
    .eq("id", courseId)
    .single();

  if (courseError || !course) throw new Error("Course not found");

  const freeTiers = ['beginner', 'intermediate'];
  const isFreeCourse = freeTiers.includes((course.difficulty || '').toLowerCase());

  if (!isFreeCourse && user.membership_status !== 'member') {
    throw new Error("This is an advanced course. Active membership is required to enroll.");
  }

  const { data, error } = await supabase
    .from("enrollments")
    .insert([{ user_id: realUserId, course_id: courseId, status: 'active' }])
    .select();

  if (error) {
    if (error.code === '23505') throw new Error("Already enrolled in this course");
    throw error;
  }
  return data[0];
};

exports.getMyEnrollments = async (userId) => {
  const realUserId = await resolveUserId(userId);

  const { data, error } = await supabase
    .from("enrollments")
    .select(`
      status,
      created_at,
      course_id,
      courses (*)
    `)
    .eq("user_id", realUserId);
  if (error) throw error;

  const enrollments = data || [];

  if (enrollments.length > 0) {
    const courseIds = enrollments.map(e => e.course_id);
    const { data: progressData, error: progError } = await supabase
      .from("course_progress")
      .select("course_id, module_name")
      .eq("user_id", realUserId)
      .in("course_id", courseIds);

    if (!progError && progressData) {
      enrollments.forEach(enr => {
        const completed = progressData.filter(p => p.course_id === enr.course_id);
        enr.completedModules = completed.length;
      });
    }
  }

  return enrollments;
};

exports.recordProgress = async (userId, courseId, moduleName) => {
  const realUserId = await resolveUserId(userId);

  const { error } = await supabase
    .from("course_progress")
    .upsert(
      { user_id: realUserId, course_id: courseId, module_name: moduleName },
      { onConflict: 'user_id, course_id, module_name' }
    );
  if (error) throw error;
  return true;
};