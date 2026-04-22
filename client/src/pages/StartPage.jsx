import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";

function StartPage() {
  const navigate = useNavigate();
  const { profile, loading } = useUserStore();
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // If instructor, redirect immediately
  if (!loading && profile?.role === "instructor") {
    navigate("/instructor/dashboard");
    return null;
  }

  const handleStart = () => {
    if (!selectedGoal) return;
    setSubmitting(true);
    localStorage.setItem("onboardingComplete", "true");
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  const goals = [
    {
      id: "basics",
      icon: "👋",
      title: "Everyday Conversations",
      desc: "Learn standard alphabet, greetings, and basic daily phrases.",
      color: "#3b82f6"
    },
    {
      id: "medical",
      icon: "🏥",
      title: "Healthcare Environment",
      desc: "Master specialized medical triage and consent terminology.",
      color: "#ec4899"
    },
    {
      id: "speed",
      icon: "⚡",
      title: "Fluency & Core Speed",
      desc: "Use AI visual heatmaps to analyze your motion and speed.",
      color: "#f59e0b"
    }
  ];

  return (
    <div className="bg-subtle" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div className="card glass" style={{ maxWidth: "800px", width: "100%", padding: "48px", textAlign: "center", position: "relative", overflow: "hidden" }}>

        {/* Decorative background blur */}
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "300px", height: "300px", background: "var(--accent)", filter: "blur(100px)", opacity: 0.2, zIndex: 0 }}></div>
        <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "300px", height: "300px", background: "#ec4899", filter: "blur(100px)", opacity: 0.1, zIndex: 0 }}></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="badge" style={{ margin: "0 auto 24px", background: "var(--accent-bg)", color: "var(--accent)" }}>Welcome to SignSync</div>
          <h1 style={{ fontSize: "36px", marginBottom: "16px" }}>Let's customize your experience.</h1>
          <p style={{ fontSize: "16px", color: "var(--text)", marginBottom: "40px", maxWidth: "500px", margin: "0 auto 40px" }}>
            To ensure our AI provides the most relevant curriculum and tracking data, what is your primary reason for learning ASL today?
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "48px" }}>
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                style={{
                  background: selectedGoal === goal.id ? `rgba(${parseInt(goal.color.slice(1, 3), 16)}, ${parseInt(goal.color.slice(3, 5), 16)}, ${parseInt(goal.color.slice(5, 7), 16)}, 0.1)` : "var(--bg-subtle)",
                  border: selectedGoal === goal.id ? `2px solid ${goal.color}` : "2px solid transparent",
                  padding: "32px 24px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  transform: selectedGoal === goal.id ? "translateY(-4px)" : "none",
                  boxShadow: selectedGoal === goal.id ? `0 10px 30px rgba(${parseInt(goal.color.slice(1, 3), 16)}, ${parseInt(goal.color.slice(3, 5), 16)}, ${parseInt(goal.color.slice(5, 7), 16)}, 0.2)` : "none"
                }}
              >
                <div style={{ fontSize: "40px", marginBottom: "16px" }}>{goal.icon}</div>
                <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>{goal.title}</h3>
                <p style={{ fontSize: "13px", color: "var(--text)", lineHeight: "1.5" }}>{goal.desc}</p>
              </div>
            ))}
          </div>

          <button
            className="primary"
            disabled={!selectedGoal || submitting}
            onClick={handleStart}
            style={{
              padding: "16px 48px",
              fontSize: "16px",
              width: "auto",
              opacity: !selectedGoal ? 0.5 : 1
            }}
          >
            {submitting ? "Preparing your Dashboard..." : "Continue to Dashboard →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
