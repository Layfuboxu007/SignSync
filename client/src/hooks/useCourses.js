import { useState, useEffect, useCallback } from "react";
import { API } from "../api";

export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoursesAndEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      const [coursesRes, enrollmentsRes] = await Promise.all([
        API.get("/courses"),
        API.get("/courses/my-enrollments")
      ]);
      setCourses(coursesRes.data || []);
      setEnrollments(enrollmentsRes.data || []);
    } catch (err) {
      console.error("Error fetching courses data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, [fetchCoursesAndEnrollments]);

  const enrollInCourse = async (courseId) => {
    try {
      const res = await API.post(`/courses/${courseId}/enroll`);
      if (res.data.success) {
        await fetchCoursesAndEnrollments(); // Refresh enrollments
        return { success: true };
      }
    } catch (err) {
      console.error("Enrollment failed:", err);
      return { success: false, message: err.response?.data?.error || "Enrollment failed" };
    }
  };

  return {
    courses,
    enrollments,
    loading,
    enrollInCourse,
    refresh: fetchCoursesAndEnrollments
  };
}
