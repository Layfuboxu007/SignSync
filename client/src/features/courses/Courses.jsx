import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

function Courses() {
  const navigate = useNavigate();
  const [activeCourse, setActiveCourse] = useState(null);

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
                  <div style={{ width: "80px", height: "80px", background: `rgba(${parseInt(activeCourse.color.slice(1,3), 16)}, ${parseInt(activeCourse.color.slice(3,5), 16)}, ${parseInt(activeCourse.color.slice(5,7), 16)}, 0.1)`, borderRadius: "20px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "40px", marginBottom: "24px" }}>
                    {activeCourse.icon}
                  </div>
                  <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>{activeCourse.title}</h2>
                  <p style={{ fontSize: "16px", color: "var(--text)", marginBottom: "40px", lineHeight: "1.6" }}>
                    {activeCourse.desc}
                  </p>
                  
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
                      width: "100%", 
                      padding: "16px", 
                      background: activeCourse.premium ? "transparent" : "var(--accent)", 
                      border: activeCourse.premium ? "2px solid var(--border)" : "none",
                      color: activeCourse.premium ? "var(--text)" : "#000",
                      fontSize: "16px",
                      fontWeight: "bold"
                    }}
                  >
                    {activeCourse.premium ? "Unlock with Pro" : "Start Course"}
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
    </MainLayout>
  );
}

export default Courses;
