import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { API } from "../../api"; // Using configured API handler

function Courses() {
  const navigate = useNavigate();
  const [activeCourse, setActiveCourse] = useState(null);
  
  // Real database states
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionProcessing, setTransactionProcessing] = useState(false);

  // Fetch Courses and Enrollments on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          API.get("/courses"),
          API.get("/courses/my-enrollments")
        ]);
        
        // Ensure courses from backend have correct styling fields or defaults
        setCourses(coursesRes.data || []);
        // Map enrollments to an array of course_ids for easy checking
        setEnrollments(enrollmentsRes.data ? enrollmentsRes.data.map(e => e.course_id) : []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isEnrolled = (courseId) => enrollments.includes(courseId);

  const handleAction = async () => {
    if (!activeCourse) return;
    
    // If user already owns the course OR the course is free
    if (isEnrolled(activeCourse.id) || !activeCourse.premium) {
      if (activeCourse.id === 1001 || activeCourse.id === 1) { // Basic alphabet mock router
        navigate("/practice", { state: { curriculum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] } });
      } else {
        navigate("/practice");
      }
      return;
    }

    // Attempt Transaction to unlock
    try {
      setTransactionProcessing(true);
      const res = await API.post("/courses/enroll", { 
        course_id: activeCourse.id, 
        amount: 29.99 // Mock payment amount 
      });
      
      if (res.data.success) {
        // Unlock successful, add to local enrollments state
        setEnrollments([...enrollments, activeCourse.id]);
        alert("Transaction complete! Course unlocked via ACID Transaction.");
      }
    } catch (err) {
      console.error(err);
      alert("Transaction failed. Safe rollback executed.");
    } finally {
      setTransactionProcessing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <h2>Loading Curriculum...</h2>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="container" style={{ paddingTop: "80px", paddingBottom: "100px" }}>
          {activeCourse ? (
            <div className="course-viewer" style={{ animation: "fadeIn 0.3s ease-out" }}>
              <button 
                onClick={() => setActiveCourse(null)} 
                className="secondary" 
                style={{ marginBottom: "32px", width: "auto", padding: "8px 16px", display: "inline-flex", gap: "8px", alignItems: "center" }}
              >
                ← Back to SignSync Library
              </button>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="card" style={{ maxWidth: "600px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "80px", height: "80px", background: `rgba(${parseInt(activeCourse.color?.slice(1,3) || "3b", 16)}, ${parseInt(activeCourse.color?.slice(3,5) || "82", 16)}, ${parseInt(activeCourse.color?.slice(5,7) || "f6", 16)}, 0.1)`, borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "40px", marginBottom: "24px" }}>
                    {activeCourse.icon || "📚"}
                  </div>
                  <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>{activeCourse.title}</h2>
                  <p style={{ fontSize: "16px", color: "var(--text)", marginBottom: "40px", lineHeight: "1.6" }}>
                    {activeCourse.desc || activeCourse.gestures}
                  </p>
                  
                  <button 
                    disabled={transactionProcessing}
                    onClick={handleAction}
                    style={{ 
                      width: "100%", 
                      padding: "16px", 
                      background: (activeCourse.premium && !isEnrolled(activeCourse.id)) ? "transparent" : "var(--accent)", 
                      border: (activeCourse.premium && !isEnrolled(activeCourse.id)) ? "2px solid var(--border)" : "none",
                      color: (activeCourse.premium && !isEnrolled(activeCourse.id)) ? "var(--text)" : "#000",
                      fontSize: "16px",
                      fontWeight: "bold",
                      opacity: transactionProcessing ? 0.7 : 1,
                      cursor: transactionProcessing ? "not-allowed" : "pointer"
                    }}
                  >
                    {transactionProcessing ? "Processing Transaction..." 
                      : isEnrolled(activeCourse.id) ? "Continue Course" 
                      : activeCourse.premium ? "Unlock with Pro (Real Transaction test)" : "Start Course"}
                  </button>
                  <style>{`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* SignSync Branded Banner */}
              <div style={{ background: "linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(13,148,136,0.2) 100%)", borderRadius: "24px", padding: "40px", marginBottom: "40px", border: "1px solid rgba(20,184,166,0.3)" }}>
                <div className="badge" style={{ marginBottom: "16px", background: "var(--accent)", color: "#000" }}>SignSync Curriculum</div>
                <h1 style={{ fontSize: "36px", marginBottom: "16px" }}>Master ASL with AI Precision.</h1>
                <p style={{ color: "var(--text)", fontSize: "16px", maxWidth: "600px", lineHeight: "1.6" }}>
                  Every course below is fetched from the PostgreSQL database using explicit JOINs. Premium courses utilize complex multi-table SQL Transactions to ensure Database Consistency.
                </p>
              </div>

              <div className="grid">
                {courses.map((course, i) => (
                  <div key={i} className="card" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
                    {course.premium && !isEnrolled(course.id) && (
                      <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "12px", color: "#ec4899", fontWeight: "700", background: "rgba(236,72,153,0.1)", padding: "4px 8px", borderRadius: "8px" }}>
                        SIGNSYNC PRO
                      </div>
                    )}
                    {isEnrolled(course.id) && (
                      <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "12px", color: "#14b8a6", fontWeight: "700", background: "rgba(20,184,166,0.1)", padding: "4px 8px", borderRadius: "8px" }}>
                        ENROLLED
                      </div>
                    )}
                    
                    <div style={{ width: "64px", height: "64px", background: `rgba(${parseInt(course.color?.slice(1,3) || "3b", 16)}, ${parseInt(course.color?.slice(3,5) || "82", 16)}, ${parseInt(course.color?.slice(5,7) || "f6", 16)}, 0.1)`, borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "32px", marginBottom: "20px" }}>
                      {course.icon || "📚"}
                    </div>
                    
                    <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>{course.title}</h3>
                    <p style={{ fontSize: "13px", color: "var(--text)", marginBottom: "16px", flex: 1, lineHeight: "1.4" }}>
                      {course.desc || course.gestures}
                    </p>
                    
                    <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "var(--text)", marginBottom: "24px", opacity: 0.8 }}>
                      <span style={{ fontWeight: "600", color: course.color || "#3b82f6" }}>{course.difficulty || "General"}</span>
                      <span>•</span>
                      <span>{course.modules || 1} Modules</span>
                    </div>
                    
                    <button 
                      onClick={() => setActiveCourse(course)}
                      style={{ width: "100%", padding: "12px", background: "var(--accent-bg)", border: "1px solid rgba(20,184,166,0.3)", color: "var(--accent)", fontWeight: "600", transition: "all 0.2s" }}
                    >
                      {course.premium && !isEnrolled(course.id) ? "View PRO Details" : "Start SignSync Session"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
    </MainLayout>
  );
}

export default Courses;
