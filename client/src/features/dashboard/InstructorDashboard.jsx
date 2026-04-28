import { useState } from "react";
import { useUserStore } from "../../store/userStore";
import { PlusCircle, XCircle, Video, BookOpen, Users, Activity, Layers } from "lucide-react";

function InstructorDashboard() {
  const { profile } = useUserStore();
  const currentUser = profile?.first_name || profile?.username || "Instructor";
  const [showBuilder, setShowBuilder] = useState(false);

  const activeCourses = [
    { title: "ASL Complete Basics", students: 142, avgScore: "94%", active: true },
    { title: "Medical Triage 101", students: 38, avgScore: "88%", active: true },
  ];

  return (
    <>
      <header className="flex justify-between items-center animate-fade-in" style={{ flexWrap: "wrap", gap: "16px", marginBottom: "40px" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-xl)", marginBottom: "4px" }}>Instructor {currentUser}</h1>
          <p className="text-muted text-sm">Manage your courses and view student AI tracking metrics.</p>
        </div>
        <button onClick={() => setShowBuilder(!showBuilder)} className={showBuilder ? "secondary" : ""} style={{ width: "auto", padding: "12px 24px" }}>
          {showBuilder ? <><XCircle size={18}/> Cancel Builder</> : <><PlusCircle size={18}/> Create New Lesson</>}
        </button>
      </header>

      {showBuilder ? (
        <section className="card-outer animate-fade-in">
          <div className="badge flex items-center gap-2" style={{ marginBottom: "24px", width: "max-content", background: "var(--color-brand-light)", color: "var(--color-brand-dark)", borderColor: "var(--color-brand)" }}>
            <Activity size={14} /> AI Lesson Builder
          </div>
          <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "8px" }}>Configure Tracker</h2>
          <p className="text-muted text-sm mb-6 max-w-prose" style={{ marginBottom: "32px" }}>
             Add the specific ASL signs you want the SignSync AI to track during this lesson.
          </p>
          
          <div className="grid" style={{ marginBottom: "32px", gap: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "600", marginBottom: "8px", color: "var(--color-text-primary)" }}>Lesson Title</label>
              <input type="text" placeholder="e.g., Emergency Room Basics" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "600", marginBottom: "8px", color: "var(--color-text-primary)" }}>Target ASL Gestures to Track (Comma separated)</label>
              <input type="text" placeholder="e.g., Help, Pain, Doctor..." />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "600", marginBottom: "8px", color: "var(--color-text-primary)" }}>Minimum Mastery Score (%)</label>
              <input type="number" placeholder="85" defaultValue="85" />
            </div>
          </div>

          <div className="card-inner flex flex-col items-center justify-center text-center cursor-pointer" style={{ borderStyle: "dashed", marginBottom: "32px", padding: "40px" }}>
            <div style={{ color: "var(--color-text-muted)", marginBottom: "16px" }}>
              <Video size={36} strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: "var(--text-base)", marginBottom: "8px", color: "var(--color-text-primary)" }}>Upload Reference Video</h3>
            <p className="text-muted text-sm" style={{ maxWidth: "480px" }}>The AI Engine will extract heatmap data from your video to grade students against.</p>
          </div>

          <div className="flex justify-end gap-4 border-t pt-6" style={{ borderTop: "1px solid var(--color-border)", paddingTop: "24px" }}>
            <button className="secondary" style={{ width: "auto" }} onClick={() => setShowBuilder(false)}>Discard</button>
            <button style={{ width: "auto" }}>Publish to Students</button>
          </div>
        </section>
      ) : (
        <>
          {/* Metrics */}
          <section className="grid animate-fade-in" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", marginBottom: "40px" }}>
            <div className="card-outer flex flex-col justify-between">
              <div className="badge flex items-center gap-2" style={{ background: "var(--color-overlay)", borderColor: "var(--color-border-strong)", width: "max-content", marginBottom: "16px" }}><Users size={14}/> Total Students</div>
              <h2 style={{ fontSize: "var(--text-3xl)", margin: "8px 0", color: "var(--color-text-primary)" }}>180</h2>
              <p className="text-sm font-semibold" style={{ color: "var(--color-brand)" }}>+12 this week</p>
            </div>
            <div className="card-outer flex flex-col justify-between">
              <div className="badge flex items-center gap-2" style={{ background: "var(--color-brand-light)", color: "var(--color-brand-dark)", borderColor: "var(--color-brand)", width: "max-content", marginBottom: "16px" }}><Activity size={14}/> Avg. Tracker Score</div>
              <h2 style={{ fontSize: "var(--text-3xl)", margin: "8px 0", color: "var(--color-text-primary)" }}>91%</h2>
              <p className="text-muted text-sm">Across all lessons</p>
            </div>
            <div className="card-outer flex flex-col justify-between">
              <div className="badge flex items-center gap-2" style={{ background: "rgba(236,72,153,0.1)", color: "#ec4899", borderColor: "rgba(236,72,153,0.3)", width: "max-content", marginBottom: "16px" }}><Layers size={14}/> Modules Published</div>
              <h2 style={{ fontSize: "var(--text-3xl)", margin: "8px 0", color: "var(--color-text-primary)" }}>2</h2>
              <p className="text-muted text-sm">View details below</p>
            </div>
          </section>

          {/* Courses */}
          <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "20px" }}>Your Active Courses</h2>
            <div className="flex flex-col gap-4">
              {activeCourses.map((course, i) => (
                <div key={i} className="card-outer flex justify-between items-center" style={{ flexWrap: "wrap", gap: "24px" }}>
                  <div className="flex items-center gap-4">
                    <div style={{ width: "48px", height: "48px", background: "var(--color-brand-light)", color: "var(--color-brand-dark)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <BookOpen size={20} className="stroke-[2.5px]" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "var(--text-base)", marginBottom: "4px" }}>{course.title}</h3>
                      <p className="text-sm flex items-center gap-2 text-muted">Status: <span style={{ color: "var(--color-brand)", fontWeight: "600" }}>Active</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-right flex-wrap">
                    <div>
                      <p className="text-xs text-muted font-semibold mb-1">Students enrolled</p>
                      <p style={{ fontSize: "var(--text-md)", fontWeight: "700" }}>{course.students}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted font-semibold mb-1">Avg tracking accuracy</p>
                      <p style={{ fontSize: "var(--text-md)", fontWeight: "700", color: "var(--color-brand)" }}>{course.avgScore}</p>
                    </div>
                    <button className="secondary" style={{ width: "auto", padding: "10px 20px" }}>Edit Module</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </>
  );
}

export default InstructorDashboard;
