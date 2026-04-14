import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function Courses() {
  const navigate = useNavigate();
  const [activeCourse, setActiveCourse] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) setIsLoggedIn(true);
  }, []);

  const courses = [
    { 
      id: 1, title: "AI Real-Time: Alphabet Basics", difficulty: "Beginner", modules: 5, duration: "2 Hours", icon: "🤖", color: "#14b8a6", 
      desc: "Use your camera to get instant AI corrections. This module tests your ability to accurately sign 'A', 'B', and 'V'." 
    },
    { 
      id: 2, title: "Visual Tracking: Speed", difficulty: "Intermediate", modules: 8, duration: "3.5 Hours", icon: "🔥", color: "#f59e0b", 
      desc: "Analyze your motion flow and speed using our proprietary visual heatmap tracking tech." 
    },
    { 
      id: 3, title: "Contextual: Daily Life", difficulty: "Beginner", modules: 4, duration: "1.5 Hours", icon: "🛒", color: "#3b82f6", 
      desc: "Master situational awareness and practical signs for grocery shopping and traveling." 
    },
    { 
      id: 4, title: "Healthcare: ER Triage", difficulty: "Advanced", modules: 10, duration: "5 Hours", icon: "⚕️", color: "#ef4444", premium: true, 
      desc: "Bridging the gap in medical settings. Ensure clear, accurate communication when it matters most." 
    },
    { 
      id: 5, title: "Healthcare: Consent", difficulty: "Advanced", modules: 12, duration: "6 Hours", icon: "🏥", color: "#ec4899", premium: true, 
      desc: "Accurate ASL communication tailored for medical consent and complicated procedures." 
    },
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="container nav-container">
        <div className="logo">Sign<span>Sync</span></div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link to="/" style={{ color: "var(--text)" }}>Home</Link>
          <Link to="/courses" style={{ color: "var(--text-h)", fontWeight: "600" }}>Courses</Link>
          <Link to="/about" style={{ color: "var(--text)" }}>About</Link>
          {isLoggedIn ? (
            <Link to="/dashboard" style={{ marginLeft: "20px" }}>
              <button className="primary" style={{ width: "auto" }}>Go to Dashboard</button>
            </Link>
          ) : (
            <>
              <Link to="/login" style={{ color: "var(--text)", marginLeft: "20px" }}>Log In</Link>
              <Link to="/register">
                <button className="secondary" style={{ width: "auto" }}>Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
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

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>
                {/* AI Camera Placeholder */}
                <div className="card" style={{ padding: 0, height: "450px", background: "#0a0a0a", position: "relative", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", border: "1px solid var(--panel-border)" }}>
                  
                  <div style={{ position: "absolute", top: "20px", left: "20px", background: "rgba(0,0,0,0.6)", color: "#10b981", padding: "6px 12px", borderRadius: "8px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px", zIndex: 10 }}>
                    <div style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%", animation: "pulse 2s infinite" }}></div>
                    SignSync Edge Engine Active
                  </div>
                  
                  {/* Subject Scanner Box */}
                  <div style={{ width: "240px", height: "300px", border: "2px dashed rgba(20, 184, 166, 0.4)", borderRadius: "12px", position: "relative" }}>
                    <div style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "4px", background: "var(--accent)", boxShadow: "0 0 15px var(--accent)", animation: "scan 3s linear infinite" }}></div>
                  </div>
                  
                  <p style={{ position: "absolute", bottom: "32px", color: "#fff", opacity: 0.5, fontSize: "14px" }}>
                    Waiting for hand gestures... Position yourself in the SignSync frame.
                  </p>

                  <style>{`
                    @keyframes scan {
                      0% { top: 0; opacity: 1; }
                      50% { top: 100%; opacity: 0.3; }
                      100% { top: 0; opacity: 1; }
                    }
                    @keyframes pulse {
                      0% { opacity: 1; }
                      50% { opacity: 0.5; }
                      100% { opacity: 1; }
                    }
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>
                </div>

                {/* AI Feedback Panel */}
                <div className="card" style={{ height: "450px", display: "flex", flexDirection: "column" }}>
                  <div className="badge" style={{ background: `rgba(${parseInt(activeCourse.color.slice(1,3), 16)}, ${parseInt(activeCourse.color.slice(3,5), 16)}, ${parseInt(activeCourse.color.slice(5,7), 16)}, 0.1)`, color: activeCourse.color, marginBottom: "16px" }}>
                    SignSync Live Matrix
                  </div>
                  <h2 style={{ fontSize: "22px", marginBottom: "8px" }}>{activeCourse.title}</h2>
                  <p style={{ fontSize: "14px", color: "var(--text)", marginBottom: "32px", lineHeight: "1.5" }}>
                    {activeCourse.desc}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                      <span style={{ color: "var(--text-h)", fontSize: "14px" }}>Skeletal Accuracy</span>
                      <span style={{ color: "#10b981", fontWeight: "700", fontSize: "14px" }}>Tracking via Edge AI</span>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                      <span style={{ color: "var(--text-h)", fontSize: "14px" }}>Motion Heatmap</span>
                      <span style={{ color: "#f59e0b", fontWeight: "700", fontSize: "14px" }}>Rendering...</span>
                    </li>
                    <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                      <span style={{ color: "var(--text-h)", fontSize: "14px" }}>Lexicon Match</span>
                      <span style={{ color: "var(--text)", fontSize: "14px", opacity: 0.5 }}>Awaiting Input</span>
                    </li>
                  </ul>

                  <button 
                    onClick={() => {
                      if (!activeCourse.premium) {
                        if (activeCourse.id === 1) {
                          navigate("/practice", { state: { curriculum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] } });
                        } else {
                          navigate("/practice");
                        }
                      }
                    }}
                    style={{ 
                      marginTop: "auto", 
                      width: "100%", 
                      padding: "14px", 
                      background: activeCourse.premium ? "transparent" : "var(--accent)", 
                      border: activeCourse.premium ? "2px solid var(--border)" : "none",
                      color: activeCourse.premium ? "var(--text)" : "#000" 
                    }}
                  >
                    {activeCourse.premium ? "Unlock with Pro" : "Start Practical AI Session"}
                  </button>
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
                  Every course below is powered by the <strong>SignSync Edge API</strong>. Unlike traditional video lectures, our platform uses your local camera to generate a massive 60FPS tracking heatmap, giving you real-world feedback in absolute privacy.
                </p>
              </div>

              <div className="grid">
                {courses.map((course, i) => (
                  <div key={i} className="card" style={{ position: "relative", display: "flex", flexDirection: "column" }}>
                    {course.premium && (
                      <div style={{ position: "absolute", top: "16px", right: "16px", fontSize: "12px", color: "#ec4899", fontWeight: "700", background: "rgba(236,72,153,0.1)", padding: "4px 8px", borderRadius: "8px" }}>
                        SIGNSYNC PRO
                      </div>
                    )}
                    <div style={{ width: "64px", height: "64px", background: `rgba(${parseInt(course.color.slice(1,3), 16)}, ${parseInt(course.color.slice(3,5), 16)}, ${parseInt(course.color.slice(5,7), 16)}, 0.1)`, borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "32px", marginBottom: "20px" }}>
                      {course.icon}
                    </div>
                    
                    <h3 style={{ fontSize: "18px", marginBottom: "8px" }}>{course.title}</h3>
                    <p style={{ fontSize: "13px", color: "var(--text)", marginBottom: "16px", flex: 1, lineHeight: "1.4" }}>
                      {course.desc}
                    </p>
                    
                    <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "var(--text)", marginBottom: "24px", opacity: 0.8 }}>
                      <span style={{ fontWeight: "600", color: course.color }}>{course.difficulty}</span>
                      <span>•</span>
                      <span>{course.modules} Modules</span>
                    </div>
                    
                    <button 
                      onClick={() => setActiveCourse(course)}
                      style={{ width: "100%", padding: "12px", background: "var(--accent-bg)", border: "1px solid rgba(20,184,166,0.3)", color: "var(--accent)", fontWeight: "600", transition: "all 0.2s" }}
                    >
                      {course.premium ? "View PRO Details" : "Start SignSync Session"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        <footer className="container" style={{ textAlign: "center", padding: "60px 0", borderTop: "1px solid var(--border)", marginTop: "40px" }}>
          <div className="logo" style={{ marginBottom: "16px" }}>Sign<span>Sync</span></div>
          <p style={{ opacity: 0.6, fontSize: "14px" }}>
            © 2024 SignSync AI. All rights reserved. <br/>
            Empowering communication through technology.
          </p>
        </footer>
    </div>
  );
}

export default Courses;
