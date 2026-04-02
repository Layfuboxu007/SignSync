import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const [currentUser] = useState("Alex");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const learningPaths = [
    { title: "ASL Beginner Foundations", modules: "12 Modules", level: "Lvl 1", progress: 65, color: "var(--accent)" },
    { title: "Conversational Flow", modules: "8 Modules", level: "Lvl 2", progress: 10, color: "#0ea5e9" },
    { title: "Storytelling & Nuance", modules: "10 Modules", level: "Lvl 3", progress: 0, color: "#6366f1" },
  ];

  return (
    <div className="bg-subtle" style={{ minHeight: "100vh", backgroundColor: "var(--bg-subtle)" }}>
      <div className="container dashboard-grid">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo" style={{ marginBottom: "48px" }}>Sign<span>Sync</span></div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/home" style={{ 
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", 
              background: "var(--accent-bg)", color: "var(--accent)", borderRadius: "12px", fontWeight: "700" 
            }}>
              <span style={{ fontSize: "18px" }}>📊</span> Dashboard
            </Link>
            <Link to="/classes" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--text)" }}>
              <span style={{ fontSize: "18px" }}>🎓</span> Classes
            </Link>
            <Link to="/resources" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--text)" }}>
              <span style={{ fontSize: "18px" }}>📚</span> Resources
            </Link>
            <Link to="/settings" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--text)" }}>
              <span style={{ fontSize: "18px" }}>⚙️</span> Settings
            </Link>
          </nav>

          <div style={{ marginTop: "auto", paddingTop: "40px" }}>
            <div className="card" style={{ padding: "20px", background: "var(--accent-bg)", border: "none", textAlign: "center" }}>
              <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--accent)", marginBottom: "8px" }}>PRO PLAN</p>
              <p style={{ fontSize: "13px", marginBottom: "16px" }}>Unlock all medical and professional modules.</p>
              <button style={{ fontSize: "13px", padding: "8px" }}>Upgrade</button>
            </div>
            <button className="secondary" onClick={handleLogout} style={{ marginTop: "24px", width: "100%", fontSize: "14px" }}>
              Log Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: "32px", marginBottom: "4px" }}>Welcome back, {currentUser}!</h1>
              <p style={{ color: "var(--text)" }}>You're making great progress. Ready for today's lesson?</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-h)" }}>{currentUser}</p>
                <p style={{ fontSize: "12px", color: "var(--text)" }}>Premium Learner</p>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--accent-bg)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "20px", border: "2px solid #fff" }}>
                👤
              </div>
            </div>
          </header>

          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div className="card" style={{ display: "flex", gap: "24px", alignItems: "center", background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)", color: "#fff", border: "none" }}>
              <div style={{ flex: 1 }}>
                <div className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>Current Level</div>
                <h2 style={{ color: "#fff", fontSize: "28px", margin: "8px 0" }}>Level 1: <br/>Fluent Basics</h2>
                <div style={{ height: "6px", background: "rgba(255,255,255,0.2)", borderRadius: "3px", margin: "16px 0 8px" }}>
                  <div style={{ width: "65%", height: "100%", background: "#fff", borderRadius: "3px" }}></div>
                </div>
                <p style={{ fontSize: "12px", opacity: 0.8 }}>65% to Level 2</p>
              </div>
              <div style={{ fontSize: "64px", opacity: 0.5 }}>🏆</div>
            </div>

            <div className="card" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div className="badge" style={{ background: "var(--secondary-bg)", color: "var(--secondary)" }}>Stats</div>
                <h2 style={{ fontSize: "28px", margin: "8px 0" }}>14 Lessons <br/>Completed</h2>
                <p style={{ fontSize: "14px", color: "var(--text)" }}>+2 since yesterday</p>
                <Link to="/history" style={{ display: "inline-block", marginTop: "12px", fontSize: "14px" }}>View detailed history →</Link>
              </div>
              <div style={{ fontSize: "64px" }}>🎯</div>
            </div>
          </section>

          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "22px" }}>Continue Learning</h2>
              <Link to="/classes" style={{ fontSize: "14px" }}>View all paths</Link>
            </div>
            
            <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                <div style={{ width: "80px", height: "80px", background: "var(--bg-subtle)", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "32px" }}>
                  👋
                </div>
                <div>
                  <div className="badge">FOUNDATIONS</div>
                  <h3>Common Phrases & Greetings</h3>
                  <p style={{ fontSize: "14px", color: "var(--text)" }}>Module 4  •  15 mins  •  Intermediate</p>
                </div>
              </div>
              <button style={{ width: "auto", padding: "12px 32px" }}>Resume Lesson</button>
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>Learning Paths</h2>
            <div className="grid">
              {learningPaths.map((path, i) => (
                <div key={i} className="card" style={{ position: "relative" }}>
                  <div className="badge" style={{ background: i === 0 ? "var(--accent-bg)" : "var(--bg-subtle)", color: i === 0 ? "var(--accent)" : "var(--text)" }}>
                    {path.level}
                  </div>
                  <h3 style={{ marginBottom: "8px" }}>{path.title}</h3>
                  <p style={{ fontSize: "14px", color: "var(--text)", marginBottom: "20px" }}>{path.modules}</p>
                  
                  <div style={{ height: "4px", background: "var(--bg-subtle)", borderRadius: "2px", marginBottom: "8px" }}>
                    <div style={{ width: `${path.progress}%`, height: "100%", background: path.color, borderRadius: "2px" }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ fontWeight: "700" }}>{path.progress}%</span>
                    <Link to={`/paths/${i}`}>Open</Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Home;