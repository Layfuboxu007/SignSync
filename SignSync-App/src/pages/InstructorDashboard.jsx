import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../api";

function InstructorDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState("");
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/user/me");
        if (data.role !== "instructor") {
          navigate("/dashboard"); // Kick learners out
        }
        setCurrentUser(data.first_name || data.username);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    const token = localStorage.getItem("token");
    if (!token) navigate("/");
    else fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const activeCourses = [
    { title: "ASL Complete Basics", students: 142, avgScore: "94%", active: true },
    { title: "Medical Triage 101", students: 38, avgScore: "88%", active: true },
  ];

  return (
    <div className="bg-subtle" style={{ minHeight: "100vh", backgroundColor: "var(--bg-subtle)" }}>
      <div className="container dashboard-grid">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo" style={{ marginBottom: "48px" }}>Sign<span>Sync</span> <span style={{fontSize: "12px", background: "var(--accent-bg)", color: "var(--accent)", padding: "4px 8px", borderRadius: "8px", verticalAlign: "middle", marginLeft: "8px"}}>Instructor</span></div>
          
          <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Link to="/instructor/dashboard" style={{ 
              display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", 
              background: "var(--accent-bg)", color: "var(--accent)", borderRadius: "12px", fontWeight: "700" 
            }}>
              <span style={{ fontSize: "18px" }}>📊</span> HQ Overview
            </Link>
            <Link to="#" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--text)" }}>
              <span style={{ fontSize: "18px" }}>👥</span> Student Roster
            </Link>
            <Link to="/settings" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--text)" }}>
              <span style={{ fontSize: "18px" }}>⚙️</span> Settings
            </Link>
          </nav>

          <div style={{ marginTop: "auto", paddingTop: "40px" }}>
            <button className="secondary" onClick={handleLogout} style={{ marginTop: "24px", width: "100%", fontSize: "14px" }}>
              Log Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
            <div>
              <h1 style={{ fontSize: "32px", marginBottom: "4px" }}>Instructor {currentUser}</h1>
              <p style={{ color: "var(--text)" }}>Manage your courses and view student AI tracking metrics.</p>
            </div>
            <button className="primary" onClick={() => setShowBuilder(!showBuilder)} style={{ width: "auto", padding: "14px 24px" }}>
              {showBuilder ? "Cancel Builder" : "+ Create New Lesson"}
            </button>
          </header>

          {showBuilder ? (
            <section className="card glass" style={{ animation: "fadeIn 0.3s ease-in-out" }}>
              <div className="badge" style={{ marginBottom: "16px" }}>AI Lesson Builder</div>
              <h2>Configure Tracker</h2>
              <p style={{ color: "var(--text)", marginBottom: "32px", maxWidth: "600px" }}>
                Add the specific ASL signs you want the SignSync AI to track during this lesson.
              </p>
              
              <div style={{ display: "grid", gap: "16px", marginBottom: "32px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>Lesson Title</label>
                  <input type="text" placeholder="e.g., Emergency Room Basics" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>Target ASL Gestures to Track (Comma separated)</label>
                  <input type="text" placeholder="e.g., Help, Pain, Where, Doctor..." />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>Minimum Mastery Score (%)</label>
                  <input type="number" placeholder="85" defaultValue="85" />
                </div>
              </div>

              <div style={{ padding: "40px 24px", border: "2px dashed var(--border)", borderRadius: "16px", textAlign: "center", marginBottom: "32px", background: "var(--bg-subtle)", cursor: "pointer" }}>
                <span style={{ fontSize: "32px", display: "block", marginBottom: "16px" }}>📹</span>
                <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Upload Reference Video</h3>
                <p style={{ fontSize: "14px", color: "var(--text)" }}>The AI Engine will extract heatmap data from your video to grade students against.</p>
              </div>

              <div style={{ display: "flex", gap: "16px", justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: "24px" }}>
                <button className="secondary" style={{ width: "auto" }} onClick={() => setShowBuilder(false)}>Discard</button>
                <button className="primary" style={{ width: "auto" }}>Publish to Students</button>
              </div>
            </section>
          ) : (
            <>
              {/* Metrics */}
              <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "40px" }}>
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="badge" style={{ background: "var(--secondary-bg)", color: "var(--secondary)", width: "max-content", alignSelf: "flex-start" }}>Total Students</div>
                  <h2 style={{ fontSize: "40px", margin: "16px 0 8px" }}>180</h2>
                  <p style={{ fontSize: "14px", color: "#10b981", fontWeight: "600" }}>+12 this week</p>
                </div>
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="badge" style={{ background: "rgba(20, 184, 166, 0.1)", color: "var(--accent)", width: "max-content", alignSelf: "flex-start" }}>Avg. Tracker Score</div>
                  <h2 style={{ fontSize: "40px", margin: "16px 0 8px" }}>91%</h2>
                  <p style={{ fontSize: "14px", color: "var(--text)" }}>Across all lessons</p>
                </div>
                <div className="card" style={{ display: "flex", flexDirection: "column" }}>
                  <div className="badge" style={{ background: "rgba(236,72,153,0.1)", color: "#ec4899", width: "max-content", alignSelf: "flex-start" }}>Modules Published</div>
                  <h2 style={{ fontSize: "40px", margin: "16px 0 8px" }}>2</h2>
                  <p style={{ fontSize: "14px", color: "var(--text)" }}>View details below</p>
                </div>
              </section>

              {/* Courses */}
              <section>
                <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>Your Active Courses</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {activeCourses.map((course, i) => (
                    <div key={i} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                        <div style={{ width: "48px", height: "48px", background: "var(--accent-bg)", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "24px" }}>
                          📚
                        </div>
                        <div>
                          <h3 style={{ fontSize: "18px", marginBottom: "4px" }}>{course.title}</h3>
                          <p style={{ fontSize: "14px", color: "var(--text)" }}>Status: <span style={{ color: "#10b981", fontWeight: "600" }}>Active</span></p>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", gap: "48px", textAlign: "right", alignItems: "center" }}>
                        <div>
                          <p style={{ fontSize: "12px", color: "var(--text-h)", marginBottom: "4px", opacity: 0.8 }}>Students enrolled</p>
                          <p style={{ fontSize: "18px", fontWeight: "700" }}>{course.students}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: "12px", color: "var(--text-h)", marginBottom: "4px", opacity: 0.8 }}>Avg tracking accuracy</p>
                          <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--accent)" }}>{course.avgScore}</p>
                        </div>
                        <button className="secondary" style={{ width: "auto", padding: "10px 20px" }}>Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

        </main>
      </div>
    </div>
  );
}

export default InstructorDashboard;
