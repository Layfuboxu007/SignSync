import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Lightbulb, Navigation, HeartPulse } from "lucide-react";

function About() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <header className="container" style={{ textAlign: "center", paddingTop: "80px", paddingBottom: "60px" }}>
        <div className="badge flex items-center gap-2 justify-center" style={{ margin: "0 auto 24px", width: "max-content" }}>
          Our Mission
        </div>
        <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "24px" }}>Bridging the Communication Gap</h1>
        <p className="text-muted" style={{ maxWidth: "800px", margin: "0 auto", fontSize: "var(--text-lg)" }}>
          SignSync AI was founded with a single goal: to make American Sign Language (ASL) education accessible, 
          accurate, and highly engaging using state-of-the-art visual tracking technology.
        </p>
      </header>

      {/* Core Values / Features */}
      <section className="container grid" style={{ marginTop: "40px", marginBottom: "80px" }}>
        <div className="card-outer flex flex-col items-center text-center">
          <div style={{ color: "var(--color-brand)", marginBottom: "24px" }}>
            <Lightbulb size={48} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "16px" }}>Innovation</h3>
          <p className="text-muted text-sm">
            We leverage proprietary AI motion-tracking to provide real-time, constructive feedback on hand positioning,
            ensuring you learn the physical nuances of ASL correctly without a live tutor present.
          </p>
        </div>
        <div className="card-outer flex flex-col items-center text-center">
          <div style={{ color: "var(--color-brand)", marginBottom: "24px" }}>
            <Navigation size={48} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "16px" }}>Inclusivity</h3>
          <p className="text-muted text-sm">
            Designed alongside members of the Deaf community, our curriculums go beyond just vocab. 
            We focus on facial expressions, body language, and cultural context.
          </p>
        </div>
        <div className="card-outer flex flex-col items-center text-center">
          <div style={{ color: "#ec4899", marginBottom: "24px" }}>
            <HeartPulse size={48} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "16px" }}>Real-World Impact</h3>
          <p className="text-muted text-sm">
            By offering specialized modules in medical, emergency, and customer-service contexts, 
            we empower professionals to provide better care and services to the Deaf community.
          </p>
        </div>
      </section>

      {/* Meet the Technology */}
      <section className="container animate-fade-in" style={{ background: "var(--color-overlay)", borderRadius: "var(--radius-xl)", padding: "80px 60px", marginBottom: "80px", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "60px", alignItems: "center" }}>
          <style>{`@media (min-width: 1024px) { .tech-split { grid-template-columns: 1fr 1fr; } }`}</style>
          <div className="tech-split" style={{ display: "grid", gap: "60px" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "24px" }}>The Tech Behind SignSync</h2>
              <p className="text-muted" style={{ fontSize: "var(--text-base)", marginBottom: "24px" }}>
                Our platform processes video directly in your browser. We never record or store your camera feed on our servers, ensuring total privacy. 
                Instead, a local neural network translates your skeletal movements into a mathematical Heatmap.
              </p>
              <p className="text-muted" style={{ fontSize: "var(--text-base)", marginBottom: "32px" }}>
                This heatmap is then cross-referenced in real-time against thousands of fluent ASL gestures, providing you with an accuracy score and immediate corrections to improve your motion fluidity.
              </p>
              <Link to="/courses">
                <button style={{ width: "auto" }}>See it in action</button>
              </Link>
            </div>
            
            <div className="grid">
              <div className="card-inner flex items-center justify-center text-center font-semibold text-sm" style={{ height: "140px", background: "var(--color-brand-light)", color: "var(--color-brand-dark)", borderColor: "var(--color-brand)" }}>Spatial Recognition</div>
              <div className="card-inner flex items-center justify-center text-center font-semibold text-sm" style={{ height: "140px", background: "var(--color-surface)", marginTop: "24px" }}>Privacy First Edge AI</div>
              <div className="card-inner flex items-center justify-center text-center font-semibold text-sm" style={{ height: "140px", background: "var(--color-surface)" }}>10ms Latency</div>
              <div className="card-inner flex items-center justify-center text-center font-semibold text-sm" style={{ height: "140px", background: "rgba(236,72,153,0.1)", color: "#ec4899", borderColor: "rgba(236,72,153,0.3)", marginTop: "24px" }}>60 FPS Tracking</div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default About;
