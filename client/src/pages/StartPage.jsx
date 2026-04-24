import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";
import { Hand, Building2, Zap } from "lucide-react";

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
      icon: <Hand size={32} strokeWidth={1.5} />,
      title: "Core Foundations",
      desc: "Learn standard alphabet, common greetings, and basic practical phrases.",
      color: "var(--color-brand)"
    },
    {
      id: "medical",
      icon: <Building2 size={32} strokeWidth={1.5} />,
      title: "Medical & Clinical",
      desc: "Master specialized healthcare vocabulary and patient triage terminology.",
      color: "#ec4899"
    },
    {
      id: "speed",
      icon: <Zap size={32} strokeWidth={1.5} />,
      title: "Fluency & Speed",
      desc: "Use AI visual heatmaps to analyze your hand motion and signing speed.",
      color: "#f59e0b"
    }
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyItems: "center", padding: "40px 20px" }}>
      <div className="card-outer container" style={{ maxWidth: "800px", padding: "64px", textAlign: "center" }}>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="badge flex items-center gap-2 justify-center" style={{ margin: "0 auto 24px", width: "max-content", background: "var(--color-brand-light)", color: "var(--color-brand-dark)", borderColor: "var(--color-brand)" }}>
             <Zap size={14}/> Welcome to SignSync
          </div>
          <h1 style={{ fontSize: "var(--text-2xl)", marginBottom: "16px" }}>Choose Your Learning Path</h1>
          <p className="text-muted" style={{ margin: "0 auto 48px", maxWidth: "540px" }}>
            To personalize your curriculum, please select your primary reason for learning ASL.
          </p>

          <div className="grid" style={{ gap: "24px", marginBottom: "48px" }}>
            {goals.map((goal) => (
              <div
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className="card-inner flex flex-col items-center"
                style={{
                  background: selectedGoal === goal.id ? "var(--color-brand-light)" : "var(--color-overlay)",
                  borderColor: selectedGoal === goal.id ? "var(--color-brand)" : "var(--color-border)",
                  padding: "32px 24px",
                  cursor: "pointer",
                  transition: "all var(--transition-base)",
                  transform: selectedGoal === goal.id ? "translateY(-4px)" : "none",
                  boxShadow: selectedGoal === goal.id ? "var(--shadow-md)" : "none"
                }}
              >
                <div style={{ marginBottom: "20px", color: selectedGoal === goal.id ? goal.color : "var(--color-text-secondary)" }}>{goal.icon}</div>
                <h3 style={{ fontSize: "var(--text-base)", marginBottom: "12px", color: selectedGoal === goal.id ? "var(--color-brand-dark)" : "var(--color-text-primary)" }}>{goal.title}</h3>
                <p className="text-sm" style={{ color: selectedGoal === goal.id ? "var(--color-brand-dark)" : "var(--color-text-muted)" }}>{goal.desc}</p>
              </div>
            ))}
          </div>

          <button
            disabled={!selectedGoal || submitting}
            onClick={handleStart}
            style={{
              padding: "16px 48px",
              width: "auto",
              opacity: !selectedGoal ? 0.5 : 1
            }}
          >
            {submitting ? "Preparing Dashboard..." : "Continue to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
