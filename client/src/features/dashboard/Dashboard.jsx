import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import DashboardLayout from "../../layouts/DashboardLayout";
import { User, Trophy, Target, HandMetal } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useUserStore();
  const currentUser = profile?.first_name || profile?.username || "Learner";

  const learningPaths = [
    { title: "ASL Beginner Foundations", modules: "12 Modules", level: "Lvl 1", progress: 65, color: "var(--color-brand)" },
    { title: "Conversational Flow", modules: "8 Modules", level: "Lvl 2", progress: 10, color: "hsl(200, 80%, 40%)" },
    { title: "Storytelling & Nuance", modules: "10 Modules", level: "Lvl 3", progress: 0, color: "hsl(245, 80%, 60%)" },
  ];

  return (
    <DashboardLayout>
      <header className="flex justify-between items-center animate-fade-in" style={{ flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "var(--text-xl)", marginBottom: "4px" }}>Welcome back, {currentUser}!</h1>
          <p className="text-muted text-sm">You are making excellent progress. Ready for today's lesson?</p>
        </div>
        <div className="flex items-center gap-4">
          <div style={{ textAlign: "right" }}>
            <p style={{ fontWeight: "600", fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>{currentUser}</p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Premium Account</p>
          </div>
          <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-full)", background: "var(--color-canvas)", border: "1px solid var(--color-border-strong)", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--color-text-primary)", boxShadow: "var(--shadow-sm)" }}>
            <User size={20} />
          </div>
        </div>
      </header>

      <section className="grid animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="card-outer" style={{ display: "flex", gap: "24px", alignItems: "center", background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)", color: "#fff", borderColor: "var(--color-brand-dark)" }}>
          <div style={{ flex: 1 }}>
            <div className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>CURRENT LEVEL</div>
            <h2 style={{ color: "#fff", fontSize: "var(--text-xl)", margin: "8px 0" }}>Level 1: <br/>Fluent Basics</h2>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.15)", borderRadius: "var(--radius-full)", margin: "16px 0 8px" }}>
              <div style={{ width: "65%", height: "100%", background: "#fff", borderRadius: "var(--radius-full)" }}></div>
            </div>
            <p style={{ fontSize: "var(--text-xs)", opacity: 0.8 }}>65% progress to Level 2</p>
          </div>
          <div style={{ opacity: 0.3, color: "#fff" }}>
            <Trophy size={64} strokeWidth={1} />
          </div>
        </div>

        <div className="card-outer" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div className="badge" style={{ background: "var(--color-overlay)", borderColor: "var(--color-border-strong)" }}>ANALYTICS</div>
            <h2 style={{ fontSize: "var(--text-xl)", margin: "8px 0" }}>14 Modules <br/>Completed</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>+2 since yesterday</p>
            <Link to="/history" style={{ display: "inline-block", marginTop: "12px", fontSize: "var(--text-sm)", fontWeight: "600" }}>View detailed history →</Link>
          </div>
          <div style={{ color: "var(--color-brand-light)" }}>
            <Target size={64} strokeWidth={1.5} color="var(--color-brand)" />
          </div>
        </div>
      </section>

      <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "var(--text-lg)" }}>Continue Learning</h2>
          <Link to="/courses" style={{ fontSize: "var(--text-sm)" }}>View all paths</Link>
        </div>
        
        <div className="card-outer" style={{ display: "flex", flexWrap: "wrap", gap: "24px", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div style={{ width: "64px", height: "64px", background: "var(--color-overlay)", border: "1px solid var(--color-border-strong)", borderRadius: "var(--radius-lg)", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--color-brand)" }}>
              <HandMetal size={28} />
            </div>
            <div>
              <div className="badge" style={{ marginBottom: "8px" }}>FOUNDATIONS</div>
              <h3 style={{ fontSize: "var(--text-md)" }}>Common Phrases & Greetings</h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>Module 4  •  15 mins</p>
            </div>
          </div>
          <button style={{ width: "auto" }} onClick={() => navigate("/practice")}>Resume Lesson</button>
        </div>
      </section>

      <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
        <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "20px" }}>Active Courses</h2>
        <div className="grid">
          {learningPaths.map((path, i) => (
            <div key={i} className="card-outer" style={{ position: "relative" }}>
              <div className="badge" style={{ marginBottom: "16px", background: i === 0 ? "var(--color-brand-light)" : "var(--color-overlay)", color: i === 0 ? "var(--color-brand-dark)" : "var(--color-text-secondary)", borderColor: i === 0 ? "var(--color-brand)" : "var(--color-border-strong)" }}>
                {path.level}
              </div>
              <h3 style={{ marginBottom: "8px", fontSize: "var(--text-md)" }}>{path.title}</h3>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginBottom: "20px" }}>{path.modules}</p>
              
              <div style={{ height: "4px", background: "var(--color-overlay)", borderRadius: "var(--radius-full)", marginBottom: "8px", overflow: "hidden" }}>
                <div style={{ width: `${path.progress}%`, height: "100%", background: path.color, borderRadius: "var(--radius-full)" }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)" }}>
                <span style={{ fontWeight: "700" }}>{path.progress}% Complete</span>
                <Link to={"#"} style={{ fontWeight: "600" }}>Start →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}

export default Dashboard;