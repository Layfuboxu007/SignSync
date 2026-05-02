import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCourses } from "../../hooks/useCourses";
import { useUserStore } from "../../store/userStore";
import { Bot, Flame, ShoppingCart, HeartPulse, Building2, BookOpen, Lock, CheckCircle2, Crown, ArrowLeft } from "lucide-react";
import { Alert } from "../../components/common/Alert";
import MembershipModal from "../../components/checkout/MembershipModal";

const getIcon = (iconStr, size = 32) => {
  switch(iconStr) {
    case '🤖': return <Bot size={size} />;
    case '🔥': return <Flame size={size} />;
    case '🛒': return <ShoppingCart size={size} />;
    case '⚕️': return <HeartPulse size={size} />;
    case '🏥': return <Building2 size={size} />;
    default: return <BookOpen size={size} />;
  }
};

const isFreeCourse = (course) => {
  const tier = (course.difficulty || '').toLowerCase();
  return tier === 'beginner' || tier === 'intermediate';
};

export default function CourseCatalogPage() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const { courses, enrollments, loading, enrollInCourse } = useCourses();
  
  const [activeCourse, setActiveCourse] = useState(null);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error' | 'warning', message }
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isEnrolled = (courseId) => enrollments.some(e => e.course_id === courseId);

  const clearFeedback = () => setFeedback(null);

  const handleAction = async () => {
    if (!activeCourse) return;
    clearFeedback();
    
    // Already enrolled — go practice
    if (isEnrolled(activeCourse.id)) {
      navigate("/practice", { state: { curriculum: activeCourse.gestures || ['Thumbs Up Demo'] } });
      return;
    }

    // Advanced course and user is free tier
    if (!isFreeCourse(activeCourse) && profile?.membership_status !== 'member') {
      setIsModalOpen(true);
      return;
    }

    try {
      setActionProcessing(true);
      const res = await enrollInCourse(activeCourse.id);
      if (res?.success) {
        setFeedback({ type: "success", message: "Successfully enrolled! You can now start practicing." });
      } else {
        setFeedback({ type: "error", message: res?.message || "Enrollment failed. Please try again." });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Something went wrong." });
    } finally {
      setActionProcessing(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <div className="text-muted font-semibold animate-fade-in">Loading Library...</div>
      </div>
    );
  }

  return (
    <>
    <main className="container animate-fade-in" style={{ paddingTop: "var(--space-20)", paddingBottom: "100px" }}>
        {activeCourse ? (
          <div>
            <button 
              onClick={() => { setActiveCourse(null); clearFeedback(); }}
              className="secondary" 
              style={{ marginBottom: "var(--space-8)", borderRadius: "var(--radius-full)" }}
            >
              <ArrowLeft size={16} /> Back to Library
            </button>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="card-outer" style={{ maxWidth: "600px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "var(--space-10)" }}>
                <div style={{ width: "80px", height: "80px", background: `rgba(${parseInt(activeCourse.color?.slice(1,3) || "3b", 16)}, ${parseInt(activeCourse.color?.slice(3,5) || "82", 16)}, ${parseInt(activeCourse.color?.slice(5,7) || "f6", 16)}, 0.1)`, color: activeCourse.color || "var(--color-brand)", borderRadius: "var(--radius-xl)", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "var(--space-6)" }}>
                  {getIcon(activeCourse.icon)}
                </div>
                <h2 style={{ marginBottom: "var(--space-2)" }}>{activeCourse.title}</h2>
                
                <div className="flex items-center gap-3" style={{ marginBottom: "var(--space-6)" }}>
                  <span className="badge" style={{ color: activeCourse.color || "var(--color-brand)" }}>
                    {activeCourse.difficulty || "General"}
                  </span>
                  {isFreeCourse(activeCourse) ? (
                    <span className="badge" style={{ background: "hsla(160, 84%, 39%, 0.1)", color: "var(--color-success)", borderColor: "hsla(160, 84%, 39%, 0.3)" }}>
                      Free
                    </span>
                  ) : (
                    <span className="badge" style={{ background: "hsla(280, 84%, 60%, 0.1)", color: "hsl(280, 84%, 60%)", borderColor: "hsla(280, 84%, 60%, 0.3)" }}>
                      <Crown size={12} /> Members Only
                    </span>
                  )}
                </div>

                <p style={{ color: "var(--color-text-secondary)", marginBottom: "var(--space-8)" }}>
                  {activeCourse.desc}
                </p>

                {/* Feedback Alert */}
                {feedback && (
                  <div style={{ width: "100%", marginBottom: "var(--space-6)" }}>
                    <Alert type={feedback.type}>
                      {feedback.message}
                      {feedback.type === "warning" && (
                        <Link to="/profile" style={{ display: "block", marginTop: "var(--space-2)", fontWeight: "600" }}>
                          Go to Profile →
                        </Link>
                      )}
                    </Alert>
                  </div>
                )}
                
                <button 
                  disabled={actionProcessing}
                  onClick={handleAction}
                  className={!isFreeCourse(activeCourse) && profile?.membership_status !== 'member' && !isEnrolled(activeCourse.id) ? "secondary" : ""}
                  style={{ 
                    width: "100%", 
                    padding: "var(--space-4)", 
                    fontSize: "var(--text-lg)",
                    opacity: actionProcessing ? 0.7 : 1,
                    cursor: actionProcessing ? "not-allowed" : "pointer"
                  }}
                >
                  {actionProcessing ? "Processing..." 
                    : isEnrolled(activeCourse.id) ? "Continue Course" 
                    : !isFreeCourse(activeCourse) && profile?.membership_status !== 'member' 
                      ? <><Lock size={18}/> Requires Membership</>
                      : "Enroll Now — Free"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ background: "linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-canvas) 100%)", borderRadius: "var(--radius-xl)", padding: "var(--space-10)", marginBottom: "var(--space-10)", border: "1px solid var(--color-brand-light)" }}>
              <div className="badge" style={{ marginBottom: "var(--space-4)" }}>SignSync Catalog</div>
              <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)", color: "var(--color-brand-dark)" }}>Master ASL with AI Precision</h1>
              <p style={{ color: "var(--color-text-secondary)", maxWidth: "600px" }}>
                Beginner and intermediate courses are completely free. Advanced courses require an active membership.
              </p>
            </div>

            <div className="grid">
              {courses.map((course, i) => (
                <div key={i} className="card-outer" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
                  {/* Status badge top-right */}
                  {isEnrolled(course.id) ? (
                    <div className="badge" style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-4)", background: "hsla(160, 84%, 39%, 0.1)", color: "var(--color-success)", borderColor: "hsla(160, 84%, 39%, 0.3)" }}>
                      <CheckCircle2 size={12}/> ENROLLED
                    </div>
                  ) : !isFreeCourse(course) ? (
                    <div className="badge" style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-4)", background: "hsla(280, 84%, 60%, 0.1)", color: "hsl(280, 84%, 60%)", borderColor: "hsla(280, 84%, 60%, 0.3)" }}>
                      <Crown size={12}/> MEMBER
                    </div>
                  ) : (
                    <div className="badge" style={{ position: "absolute", top: "var(--space-4)", right: "var(--space-4)" }}>
                      FREE
                    </div>
                  )}
                  
                  <div style={{ width: "64px", height: "64px", background: `rgba(${parseInt(course.color?.slice(1,3) || "3b", 16)}, ${parseInt(course.color?.slice(3,5) || "82", 16)}, ${parseInt(course.color?.slice(5,7) || "f6", 16)}, 0.1)`, color: course.color || "var(--color-brand)", borderRadius: "var(--radius-lg)", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "var(--space-5)" }}>
                    {getIcon(course.icon, 24)}
                  </div>
                  
                  <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-2)" }}>{course.title}</h3>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "var(--space-4)", flex: 1 }}>
                    {course.desc}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted" style={{ marginBottom: "var(--space-6)" }}>
                    <span className="font-semibold" style={{ color: course.color || "var(--color-brand)" }}>{course.difficulty || "General"}</span>
                    <span>•</span>
                    <span>{course.modules || 1} Modules</span>
                  </div>
                  
                  <button 
                    onClick={() => { setActiveCourse(course); clearFeedback(); }}
                    className="secondary"
                    style={{ width: "100%" }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
    </main>
    <MembershipModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
