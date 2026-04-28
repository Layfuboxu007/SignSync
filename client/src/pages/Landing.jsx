import { Link } from "react-router-dom";
import aslHero from "../assets/asl_hero.png";
import healthcareImg from "../assets/healthcare.png";
import { MoveRight, ShieldCheck, Activity, Target } from "lucide-react";

function Landing() {
  return (
    <>
      <header className="container hero-grid" style={{ padding: "var(--space-20) var(--space-6)", minHeight: "85vh" }}>
        <div className="animate-fade-in" style={{ order: 2 }}>
          <div className="badge flex items-center gap-2" style={{ marginBottom: "var(--space-6)", width: "max-content" }}>
            <Activity size={14}/> AI-Powered Learning
          </div>
          <h1 style={{ fontSize: "var(--text-hero)", lineHeight: "1.1", marginBottom: "var(--space-6)" }}>
            The Visual <br/>Language <br/><span style={{ color: "var(--color-brand)" }}>Mastered.</span>
          </h1>
          <p className="text-muted" style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-10)", maxWidth: "540px" }}>
            Experience the future of ASL education. Our advanced AI platform 
            provides real-time feedback to help you communicate more effectively.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register">
              <button style={{ padding: "var(--space-4) var(--space-10)", height: "auto" }}>Get Started Now <MoveRight size={16}/></button>
            </Link>
            <Link to="/about">
              <button className="secondary" style={{ padding: "var(--space-4) var(--space-10)", height: "auto" }}>Learn More</button>
            </Link>
          </div>
        </div>
        <div className="animate-fade-in" style={{ order: 1, animationDelay: "0.2s" }}>
          <div style={{ borderRadius: "var(--radius-xl)", overflow: "hidden", border: "1px solid var(--color-border-strong)", boxShadow: "0 24px 48px rgba(0,0,0,0.08)", maxHeight: "400px", display: "flex", justifyContent: "center", alignItems: "center", background: "var(--color-surface)" }}>
             <img src={aslHero} alt="ASL Learning Platform showing hand tracking interface" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
      </header>

      <section className="container" style={{ textAlign: "center", margin: "var(--space-20) auto var(--space-12)", maxWidth: "800px" }}>
        <div className="badge" style={{ marginBottom: "var(--space-4)" }}>Our Approach</div>
        <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-4)" }}>Learning for Real Life</h2>
        <p className="text-muted" style={{ margin: "0 auto" }}>
          We transcend simple memorization. Our interactive modules are designed 
          around real-life scenarios you'll actually encounter.
        </p>
      </section>

      <section className="container grid" style={{ marginBottom: "var(--space-20)" }}>
        <div className="card-outer">
          <div className="badge flex items-center gap-2" style={{ background: "var(--color-overlay)", borderColor: "var(--color-border-strong)", color: "var(--color-text-primary)", marginBottom: "var(--space-5)" }}>
             <Target size={14}/> Context
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-3)" }}>Situational Lessons</h3>
          <p className="text-muted text-sm">Master signs for grocery shopping, traveling, and social gatherings.</p>
        </div>
        <div className="card-outer">
          <div className="badge flex items-center gap-2" style={{ marginBottom: "var(--space-5)" }}>
             <Activity size={14}/> Precision
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-3)" }}>AI Feedback</h3>
          <p className="text-muted text-sm">Get instant corrections on your hand positioning and movement speed using our AI.</p>
        </div>
        <div className="card-outer">
          <div className="badge flex items-center gap-2" style={{ background: "hsla(330, 80%, 60%, 0.1)", color: "var(--color-accent)", borderColor: "hsla(330, 80%, 60%, 0.3)", marginBottom: "var(--space-5)" }}>
             <ShieldCheck size={14}/> Analytics
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-3)" }}>Visual Progress</h3>
          <p className="text-muted text-sm">Watch your fluency grow with detailed tracking and visual heatmaps.</p>
        </div>
      </section>

      <section className="container" style={{ padding: "var(--space-20) var(--space-6)" }}>
        <div className="feature-split">
          <div className="card-inner" style={{ padding: "var(--space-10)", borderRadius: "calc(var(--radius-xl) + 8px)", border: "none", background: "linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-canvas) 100%)" }}>
            <img src={healthcareImg} alt="Healthcare professional using ASL communication" style={{ width: "100%", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)" }} />
          </div>
          <div>
            <div className="badge flex items-center gap-2" style={{ background: "hsla(330, 80%, 60%, 0.1)", color: "var(--color-accent)", borderColor: "hsla(330, 80%, 60%, 0.3)", marginBottom: "var(--space-5)" }}>
               <ShieldCheck size={14} /> Specialized
            </div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-6)" }}>Healthcare <br/>Communication</h2>
            <p className="text-muted" style={{ marginBottom: "var(--space-8)", fontSize: "var(--text-base)" }}>
              Bridging the gap in medical settings. Specialized modules designed for 
              doctors and nurses to ensure clear communication when it matters most.
            </p>
            <Link to="/courses">
              <button className="secondary" style={{ width: "auto" }}>View Healthcare Module</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ marginBottom: "var(--space-20)", marginTop: "var(--space-20)" }}>
        <div className="card-outer" style={{ background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)", borderRadius: "calc(var(--radius-xl) + 16px)", padding: "100px var(--space-10)", textAlign: "center", border: "none" }}>
          <h2 style={{ color: "#fff", fontSize: "var(--text-3xl)", marginBottom: "var(--space-6)" }}>Ready to start your journey?</h2>
          <p style={{ color: "var(--color-brand-light)", fontSize: "var(--text-md)", marginBottom: "var(--space-12)", maxWidth: "600px", margin: "0 auto var(--space-12)" }}>
            Join thousands of students learning ASL with SignSync AI today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center" style={{ maxWidth: "500px", margin: "0 auto" }}>
            <Link to="/register" style={{ flex: 1, minWidth: "240px" }}>
              <button style={{ background: "var(--color-surface)", color: "var(--color-brand-dark)", width: "100%" }}>Get Started Free</button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default Landing;