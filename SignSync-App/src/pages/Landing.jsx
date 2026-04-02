import { Link } from "react-router-dom";
import aslHero from "../assets/asl_hero.png";
import healthcareImg from "../assets/healthcare.png";

function Landing() {
  return (
    <div className="landing-page">
      <nav className="container nav-container">
        <div className="logo">Sign<span>Sync</span></div>
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          <Link to="/" style={{ color: "var(--text-h)" }}>Home</Link>
          <Link to="/courses" style={{ color: "var(--text)" }}>Courses</Link>
          <Link to="/about" style={{ color: "var(--text)" }}>About</Link>
          <Link to="/login" style={{ color: "var(--text)", marginLeft: "20px" }}>Log In</Link>
          <Link to="/register">
            <button className="secondary" style={{ width: "auto" }}>Sign Up</button>
          </Link>
        </div>
      </nav>

      <header className="container hero">
        <div className="hero-content">
          <div className="badge">AI-Powered Learning</div>
          <h1>The Visual <br/>Language <br/>Mastered.</h1>
          <p>
            Experience the future of ASL education. Our advanced AI platform 
            provides real-time feedback to help you communicate more effectively 
            in every situation.
          </p>
          <div className="cta-group" style={{ display: "flex", gap: "16px" }}>
            <Link to="/register">
              <button style={{ width: "auto", padding: "16px 40px" }}>Get Started Now</button>
            </Link>
            <Link to="/about">
              <button className="secondary" style={{ width: "auto", padding: "16px 40px" }}>Learn More</button>
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src={aslHero} alt="ASL Learning Illustration" />
        </div>
      </header>

      <section className="container section-title">
        <div className="badge">Our Approach</div>
        <h2>Learning for Real Life</h2>
        <p style={{ maxWidth: "700px", margin: "0 auto" }}>
          We don't just teach signs; we teach communication. Our lessons are 
          designed around actual scenarios you'll encounter.
        </p>
      </section>

      <section className="container grid">
        <div className="card">
          <div className="badge" style={{ background: "var(--secondary-bg)", color: "var(--secondary)" }}>Daily Life</div>
          <h3>Situational Context</h3>
          <p>Master signs for grocery shopping, traveling, and social gatherings with context-aware lessons.</p>
        </div>
        <div className="card">
          <div className="badge">Precision</div>
          <h3>AI Feedback</h3>
          <p>Get instant corrections on your hand positioning and movement speed using our proprietary AI tech.</p>
        </div>
        <div className="card">
          <div className="badge" style={{ background: "#e0f2fe", color: "#0ea5e9" }}>Progress</div>
          <h3>Visual Tracking</h3>
          <p>Watch your fluency grow with detailed heatmaps of your progress across different signing modules.</p>
        </div>
      </section>

      <section className="container feature-section">
        <div className="feature-visual">
          <img src={healthcareImg} alt="Healthcare Communication" />
        </div>
        <div className="feature-content">
          <div className="badge" style={{ background: "#fee2e2", color: "#ef4444" }}>Specilized</div>
          <h2>Healthcare <br/>Communication</h2>
          <p>
            Bridging the gap in medical settings. Specialized modules for 
            doctors, nurses, and patients to ensure clear, accurate 
            communication when it matters most.
          </p>
          <Link to="/courses/healthcare">
            <button className="secondary" style={{ width: "auto" }}>View Healthcare Module</button>
          </Link>
        </div>
      </section>

      <section className="container">
        <div className="cta-banner">
          <h2>Ready to start your journey?</h2>
          <p style={{ marginBottom: "40px", opacity: 0.9 }}>Join thousands of students learning ASL with SignSync AI today.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", maxWidth: "500px", margin: "0 auto" }}>
            <input type="email" placeholder="Enter your email" style={{ flex: 1, padding: "16px" }} />
            <Link to="/register">
              <button style={{ width: "auto", padding: "16px 32px" }}>Get Started</button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="container" style={{ textAlign: "center", padding: "60px 0", borderTop: "1px solid var(--border)", marginTop: "80px" }}>
        <div className="logo" style={{ marginBottom: "16px" }}>Sign<span>Sync</span></div>
        <p style={{ opacity: 0.6, fontSize: "14px" }}>
          © 2024 SignSync AI. All rights reserved. <br/>
          Empowering communication through technology.
        </p>
      </footer>
    </div>
  );
}

export default Landing;