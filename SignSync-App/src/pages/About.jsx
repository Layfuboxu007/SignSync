import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

function About() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) setIsLoggedIn(true);
  }, []);

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="container nav-container">
        <div className="logo">Sign<span>Sync</span></div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link to="/" style={{ color: "var(--text)" }}>Home</Link>
          <Link to="/courses" style={{ color: "var(--text)" }}>Courses</Link>
          <Link to="/about" style={{ color: "var(--text-h)" }}>About</Link>
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

      {/* Hero Section */}
      <header className="container" style={{ textAlign: "center", paddingTop: "80px", paddingBottom: "60px" }}>
        <div className="badge" style={{ margin: "0 auto 24px" }}>Our Mission</div>
        <h1 style={{ fontSize: "48px", marginBottom: "24px" }}>Bridging the Communication Gap</h1>
        <p style={{ maxWidth: "800px", margin: "0 auto", fontSize: "18px", color: "var(--text)", lineHeight: "1.6" }}>
          SignSync AI was founded with a single goal: to make American Sign Language (ASL) education accessible, 
          accurate, and highly engaging using state-of-the-art visual tracking technology.
        </p>
      </header>

      {/* Core Values / Features */}
      <section className="container grid" style={{ marginTop: "40px", marginBottom: "80px" }}>
        <div className="card" style={{ padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "24px" }}>💡</div>
          <h3 style={{ fontSize: "24px", marginBottom: "16px" }}>Innovation</h3>
          <p style={{ color: "var(--text)", lineHeight: "1.6" }}>
            We leverage proprietary AI motion-tracking to provide real-time, constructive feedback on hand positioning,
            ensuring you learn the physical nuances of ASL correctly without a live tutor present.
          </p>
        </div>
        <div className="card" style={{ padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "24px" }}>🤝</div>
          <h3 style={{ fontSize: "24px", marginBottom: "16px" }}>Inclusivity</h3>
          <p style={{ color: "var(--text)", lineHeight: "1.6" }}>
            Designed alongside members of the Deaf community, our curriculums go beyond just vocab. 
            We focus on facial expressions, body language, and cultural context.
          </p>
        </div>
        <div className="card" style={{ padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "24px" }}>🏥</div>
          <h3 style={{ fontSize: "24px", marginBottom: "16px" }}>Real-World Impact</h3>
          <p style={{ color: "var(--text)", lineHeight: "1.6" }}>
            By offering specialized modules in medical, emergency, and customer-service contexts, 
            we empower professionals to provide better care and services to the Deaf community.
          </p>
        </div>
      </section>

      {/* Meet the Technology */}
      <section className="container" style={{ background: "rgba(20, 184, 166, 0.05)", borderRadius: "24px", padding: "60px", marginBottom: "80px", border: "1px solid rgba(20, 184, 166, 0.2)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "36px", marginBottom: "24px" }}>The Tech Behind SignSync</h2>
            <p style={{ color: "var(--text)", fontSize: "16px", lineHeight: "1.6", marginBottom: "24px" }}>
              Our platform processes video directly in your browser. We never record or store your camera feed on our servers, ensuring total privacy. 
              Instead, a local neural network translates your skeletal movements into a mathematical Heatmap.
            </p>
            <p style={{ color: "var(--text)", fontSize: "16px", lineHeight: "1.6", marginBottom: "32px" }}>
              This heatmap is then cross-referenced in real-time against thousands of fluent ASL gestures, providing you with an accuracy score and immediate corrections to improve your motion fluidity.
            </p>
            <Link to="/courses">
              <button style={{ width: "auto", padding: "14px 32px" }}>See it in action</button>
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ background: "#10b981", height: "160px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", color: "#000", fontWeight: "700", opacity: 0.9 }}>Spatial Recognition</div>
            <div style={{ background: "#14b8a6", height: "160px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", color: "#000", fontWeight: "700", opacity: 0.9, transform: "translateY(40px)" }}>Privacy First Edge AI</div>
            <div style={{ background: "#0ea5e9", height: "160px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", color: "#000", fontWeight: "700", opacity: 0.9 }}>10ms Latency</div>
            <div style={{ background: "#3b82f6", height: "160px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", color: "#000", fontWeight: "700", opacity: 0.9, transform: "translateY(40px)" }}>60 FPS Tracking</div>
          </div>
        </div>
      </section>

      {/* Footer */}
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

export default About;
