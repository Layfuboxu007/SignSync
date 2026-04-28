import { Link } from "react-router-dom";
import { Lightbulb, Navigation, HeartPulse } from "lucide-react";

function About() {
  return (
    <>
      {/* Hero Section */}
      <header className="container" style={{ textAlign: "center", paddingTop: "var(--space-20)", paddingBottom: "var(--space-16)" }}>
        <div className="badge flex items-center gap-2 justify-center" style={{ margin: "0 auto var(--space-6)", width: "max-content" }}>
          Our Mission
        </div>
        <h1 style={{ fontSize: "var(--text-3xl)", marginBottom: "var(--space-6)" }}>Bridging the Communication Gap</h1>
        <p className="text-muted" style={{ maxWidth: "800px", margin: "0 auto", fontSize: "var(--text-lg)" }}>
          SignSync AI was founded with a single goal: to make American Sign Language (ASL) education accessible, 
          accurate, and highly engaging using state-of-the-art visual tracking technology.
        </p>
      </header>

      {/* Core Values */}
      <section className="container grid" style={{ marginTop: "var(--space-10)", marginBottom: "var(--space-20)" }}>
        <div className="card-outer flex flex-col items-center text-center">
          <div style={{ color: "var(--color-brand)", marginBottom: "var(--space-6)" }}>
            <Lightbulb size={48} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>Innovation</h3>
          <p className="text-muted text-sm">
            We leverage proprietary AI motion-tracking to provide real-time, constructive feedback on hand positioning,
            ensuring you learn the physical nuances of ASL correctly without a live tutor present.
          </p>
        </div>
        <div className="card-outer flex flex-col items-center text-center">
          <div style={{ color: "var(--color-brand)", marginBottom: "var(--space-6)" }}>
            <Navigation size={48} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>Inclusivity</h3>
          <p className="text-muted text-sm">
            Designed alongside members of the Deaf community, our curriculums go beyond just vocab. 
            We focus on facial expressions, body language, and cultural context.
          </p>
        </div>
        <div className="card-outer flex flex-col items-center text-center">
          <div style={{ color: "var(--color-accent)", marginBottom: "var(--space-6)" }}>
            <HeartPulse size={48} strokeWidth={1.5} />
          </div>
          <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-4)" }}>Real-World Impact</h3>
          <p className="text-muted text-sm">
            By offering specialized modules in medical, emergency, and customer-service contexts, 
            we empower professionals to provide better care and services to the Deaf community.
          </p>
        </div>
      </section>

      {/* Meet the Technology */}
      <section className="container animate-fade-in" style={{ background: "var(--color-overlay)", borderRadius: "var(--radius-xl)", padding: "var(--space-20) var(--space-16)", marginBottom: "var(--space-20)", border: "1px solid var(--color-border)" }}>
        <div className="feature-split">
          <div>
            <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-6)" }}>The Tech Behind SignSync</h2>
            <p className="text-muted" style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-6)" }}>
              Our platform processes video directly in your browser. We never record or store your camera feed on our servers, ensuring total privacy. 
              Instead, a local neural network translates your skeletal movements into a mathematical Heatmap.
            </p>
            <p className="text-muted" style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-8)" }}>
              This heatmap is then cross-referenced in real-time against thousands of fluent ASL gestures, providing you with an accuracy score and immediate corrections to improve your motion fluidity.
            </p>
            <Link to="/courses">
              <button style={{ width: "auto" }}>See it in action</button>
            </Link>
          </div>
          
          <div className="grid">
            <div className="card-inner flex items-center justify-center text-center font-semibold text-sm" style={{ height: "140px", background: "var(--color-brand-light)", color: "var(--color-brand-dark)", borderColor: "var(--color-brand)" }}>Spatial Recognition</div>
            <div className="card-inner flex items-center justify-center text-center font-semibold text-sm" style={{ height: "140px", background: "var(--color-surface)", marginTop: "var(--space-6)" }}>Privacy First Edge AI</div>
            <div className="card-inner flex items-center justify-center text-center font-semibold text-sm" style={{ height: "140px", background: "var(--color-surface)" }}>10ms Latency</div>
            <div className="card-inner flex items-center justify-center text-center font-semibold text-sm" style={{ height: "140px", background: "hsla(330, 80%, 60%, 0.1)", color: "var(--color-accent)", borderColor: "hsla(330, 80%, 60%, 0.3)", marginTop: "var(--space-6)" }}>60 FPS Tracking</div>
          </div>
        </div>
      </section>
    </>
  );
}

export default About;
