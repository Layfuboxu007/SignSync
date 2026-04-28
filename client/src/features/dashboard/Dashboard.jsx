import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { useCourses } from "../../hooks/useCourses";
import { Trophy, Target, HandMetal, BookOpen } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const { enrollments, loading } = useCourses();
  
  const currentUser = profile?.first_name || profile?.username || "Learner";

  // Compute total global progress across all enrollments
  const totalCompletedModules = enrollments.reduce((sum, enr) => sum + (enr.completedModules || 0), 0);

  return (
    <>
      <header className="animate-fade-in">
        <h1 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-1)" }}>Welcome back, {currentUser}!</h1>
        <p className="text-muted text-sm">Ready for today's lesson?</p>
      </header>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center" }} className="text-muted">Loading your progress...</div>
      ) : enrollments.length === 0 ? (
        <section className="card-outer animate-fade-in" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: "80px", height: "80px", background: "var(--color-brand-light)", color: "var(--color-brand)", borderRadius: "50%", margin: "0 auto 24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <BookOpen size={32} />
          </div>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "16px" }}>Ready to Start Learning?</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
            You haven't enrolled in any courses yet. Browse our library of AI-powered ASL courses and begin your journey.
          </p>
          <button onClick={() => navigate("/courses")}>Explore Catalog</button>
        </section>
      ) : (
        <>
          <section className="grid animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="card-outer" style={{ display: "flex", gap: "24px", alignItems: "center", background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)", color: "#fff", borderColor: "var(--color-brand-dark)" }}>
              <div style={{ flex: 1 }}>
                <div className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>CURRENT FOCUS</div>
                <h2 style={{ color: "#fff", fontSize: "var(--text-xl)", margin: "8px 0" }}>{enrollments[0].courses?.title || "Continuing Education"}</h2>
                
                <div style={{ height: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-full)", margin: "16px 0 8px" }}>
                  <div style={{ width: `${Math.min(100, Math.max(0, ((enrollments[0].completedModules || 0) / (enrollments[0].courses?.modules || 1)) * 100))}%`, height: "100%", background: "#fff", borderRadius: "var(--radius-full)", transition: "width 0.5s ease-out" }}></div>
                </div>
                
                <p style={{ fontSize: "var(--text-xs)", opacity: 0.8 }}>
                  {(enrollments[0].completedModules || 0) === 0 ? "Not started yet" : 
                   (enrollments[0].completedModules || 0) >= (enrollments[0].courses?.modules || 1) ? "Course Completed!" :
                   `${enrollments[0].completedModules || 0} / ${enrollments[0].courses?.modules || 1} Modules`}
                </p>
              </div>
              <div style={{ opacity: 0.3, color: "#fff" }}>
                <Trophy size={64} strokeWidth={1} />
              </div>
            </div>

            <div className="card-outer" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div className="badge" style={{ background: "var(--color-overlay)", borderColor: "var(--color-border-strong)" }}>ANALYTICS</div>
                <h2 style={{ fontSize: "var(--text-xl)", margin: "8px 0" }}>{totalCompletedModules} Modules <br/>Completed</h2>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Keep up the good work!</p>
              </div>
              <div style={{ color: "var(--color-brand-light)" }}>
                <Target size={64} strokeWidth={1.5} color="var(--color-brand)" />
              </div>
            </div>
          </section>

          <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "var(--text-lg)" }}>Continue Learning</h2>
              <Link to="/courses" style={{ fontSize: "var(--text-sm)" }}>Browse more</Link>
            </div>
            
            <div className="card-outer" style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                <div style={{ width: "64px", height: "64px", background: "var(--color-overlay)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-lg)", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--color-brand)" }}>
                  <HandMetal size={28} />
                </div>
                <div>
                  <div className="badge" style={{ marginBottom: "8px", textTransform: "uppercase" }}>{enrollments[0].courses?.difficulty || 'Practice'}</div>
                  <h3 style={{ fontSize: "var(--text-md)" }}>{enrollments[0].courses?.title}</h3>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Pick up where you left off</p>
                </div>
              </div>
              <button style={{ width: "auto" }} onClick={() => navigate("/practice", { state: { curriculum: enrollments[0].courses?.gestures || ['Thumbs Up Demo'], courseId: enrollments[0].course_id } })}>Resume Lesson</button>
            </div>
          </section>

          <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "20px" }}>Active Enrollments</h2>
            <div className="grid">
              {enrollments.map((enr, i) => {
                const course = enr.courses;
                if (!course) return null;
                return (
                  <div key={i} className="card-outer" style={{ position: "relative" }}>
                    <div className="badge" style={{ marginBottom: "16px", background: "var(--color-overlay)", color: "var(--color-text-secondary)", borderColor: "var(--color-border-strong)", textTransform: "uppercase" }}>
                      {course.difficulty || 'General'}
                    </div>
                    <h3 style={{ marginBottom: "8px", fontSize: "var(--text-md)" }}>{course.title}</h3>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "20px" }}>{course.modules || 1} Modules</p>
                    
                    <div style={{ height: "4px", background: "var(--color-overlay)", borderRadius: "var(--radius-full)", marginBottom: "8px", overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, ((enr.completedModules || 0) / (course.modules || 1)) * 100))}%`, height: "100%", background: course.color || "var(--color-brand)", borderRadius: "var(--radius-full)", transition: "width 0.5s ease-out" }}></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", alignItems: "center" }}>
                      <span style={{ fontWeight: "700" }}>
                        {(enr.completedModules || 0) === 0 ? "Not Started" : 
                         (enr.completedModules || 0) >= (course.modules || 1) ? "Completed" : "In Progress"}
                      </span>
                      <button className="secondary" style={{ padding: "4px 8px", fontSize: "10px" }} onClick={() => navigate("/practice", { state: { curriculum: course.gestures || ['Thumbs Up Demo'], courseId: course.id } })}>Practice →</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default Dashboard;