import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { API } from "../../api";
import { Bot, Flame, ShoppingCart, HeartPulse, Building2, BookOpen, Lock, CheckCircle2 } from "lucide-react";

// Emoji to Lucide Icon Mapper (Policy 3)
const getIcon = (iconStr) => {
  switch(iconStr) {
    case '🤖': return <Bot size={32} />;
    case '🔥': return <Flame size={32} />;
    case '🛒': return <ShoppingCart size={32} />;
    case '⚕️': return <HeartPulse size={32} />;
    case '🏥': return <Building2 size={32} />;
    default: return <BookOpen size={32} />;
  }
};

const getIconSmall = (iconStr) => {
  switch(iconStr) {
    case '🤖': return <Bot size={24} />;
    case '🔥': return <Flame size={24} />;
    case '🛒': return <ShoppingCart size={24} />;
    case '⚕️': return <HeartPulse size={24} />;
    case '🏥': return <Building2 size={24} />;
    default: return <BookOpen size={24} />;
  }
};


function Courses() {
  const navigate = useNavigate();
  const [activeCourse, setActiveCourse] = useState(null);
  
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionProcessing, setTransactionProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          API.get("/courses"),
          API.get("/courses/my-enrollments")
        ]);
        setCourses(coursesRes.data || []);
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
    
    if (isEnrolled(activeCourse.id) || !activeCourse.premium) {
      if (activeCourse.id === 1001 || activeCourse.id === 1) { 
        navigate("/practice", { state: { curriculum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] } });
      } else {
        navigate("/practice");
      }
      return;
    }

    try {
      setTransactionProcessing(true);
      const res = await API.post("/courses/enroll", { 
        course_id: activeCourse.id, 
        amount: 29.99
      });
      
      if (res.data.success) {
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
          <div className="text-muted font-semibold animate-fade-in">Loading Curriculum...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <main className="container animate-fade-in" style={{ paddingTop: "80px", paddingBottom: "100px" }}>
          {activeCourse ? (
            <div>
              <button 
                onClick={() => setActiveCourse(null)} 
                className="secondary" 
                style={{ marginBottom: "32px", borderRadius: "var(--radius-full)" }}
              >
                Back to SignSync Library
              </button>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className="card-outer" style={{ maxWidth: "600px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px" }}>
                  <div style={{ width: "80px", height: "80px", background: `rgba(${parseInt(activeCourse.color?.slice(1,3) || "3b", 16)}, ${parseInt(activeCourse.color?.slice(3,5) || "82", 16)}, ${parseInt(activeCourse.color?.slice(5,7) || "f6", 16)}, 0.1)`, color: activeCourse.color || "var(--color-brand)", borderRadius: "var(--radius-xl)", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "24px" }}>
                    {getIcon(activeCourse.icon)}
                  </div>
                  <h2 style={{ marginBottom: "16px" }}>{activeCourse.title}</h2>
                  <p style={{ color: "var(--color-text-secondary)", marginBottom: "40px" }}>
                    {activeCourse.desc || activeCourse.gestures}
                  </p>
                  
                  <button 
                    disabled={transactionProcessing}
                    onClick={handleAction}
                    className={activeCourse.premium && !isEnrolled(activeCourse.id) ? "secondary" : ""}
                    style={{ 
                      width: "100%", 
                      padding: "16px", 
                      fontSize: "var(--text-lg)",
                      opacity: transactionProcessing ? 0.7 : 1,
                      cursor: transactionProcessing ? "not-allowed" : "pointer"
                    }}
                  >
                    {transactionProcessing ? "Processing Transaction..." 
                      : isEnrolled(activeCourse.id) ? "Continue Course" 
                      : activeCourse.premium ? <><Lock size={18}/> Unlock with Pro</> : "Start Course"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* SignSync Branded Banner */}
              <div style={{ background: "linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-canvas) 100%)", borderRadius: "var(--radius-xl)", padding: "40px", marginBottom: "40px", border: "1px solid var(--color-brand-light)" }}>
                <div className="badge" style={{ marginBottom: "16px" }}>SignSync Curriculum</div>
                <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "16px", color: "var(--color-brand-dark)" }}>Master ASL with AI Precision</h1>
                <p style={{ color: "var(--color-text-secondary)", maxWidth: "600px" }}>
                  Every course below is fetched from the PostgreSQL database using explicit JOINs. Premium courses utilize complex multi-table SQL Transactions to ensure Database Consistency.
                </p>
              </div>

              <div className="grid">
                {courses.map((course, i) => (
                  <div key={i} className="card-outer" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
                    {course.premium && !isEnrolled(course.id) && (
                      <div className="badge" style={{ position: "absolute", top: "16px", right: "16px", color: "var(--color-text-muted)", background: "var(--color-overlay)", border: "1px solid var(--color-border)" }}>
                        <Lock size={12}/> PRO
                      </div>
                    )}
                    {isEnrolled(course.id) && (
                      <div className="badge" style={{ position: "absolute", top: "16px", right: "16px" }}>
                        <CheckCircle2 size={12}/> ENROLLED
                      </div>
                    )}
                    
                    <div style={{ width: "64px", height: "64px", background: `rgba(${parseInt(course.color?.slice(1,3) || "3b", 16)}, ${parseInt(course.color?.slice(3,5) || "82", 16)}, ${parseInt(course.color?.slice(5,7) || "f6", 16)}, 0.1)`, color: course.color || "var(--color-brand)", borderRadius: "var(--radius-lg)", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px" }}>
                      {getIconSmall(course.icon)}
                    </div>
                    
                    <h3 style={{ fontSize: "var(--text-md)", marginBottom: "8px" }}>{course.title}</h3>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "16px", flex: 1 }}>
                      {course.desc || course.gestures}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted" style={{ marginBottom: "24px" }}>
                      <span className="font-semibold" style={{ color: course.color || "var(--color-brand)" }}>{course.difficulty || "General"}</span>
                      <span>•</span>
                      <span>{course.modules || 1} Modules</span>
                    </div>
                    
                    <button 
                      onClick={() => setActiveCourse(course)}
                      className="secondary"
                      style={{ width: "100%" }}
                    >
                      {course.premium && !isEnrolled(course.id) ? "View Details" : "Start Session"}
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
