import { Link } from "react-router-dom";
import { Activity, ShieldCheck, Target, Zap, Video, History, Hand, Globe } from "lucide-react";

function Features() {
  return (
    <>
      {/* Hero Section */}
      <header className="container" style={{ textAlign: "center", paddingTop: "var(--space-20)", paddingBottom: "var(--space-16)" }}>
        <div className="badge flex items-center gap-2 justify-center" style={{ margin: "0 auto var(--space-6)", width: "max-content" }}>
          Platform Features
        </div>
        <h1 style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-6)" }}>
          Everything you need to <br/><span style={{ color: "var(--color-brand)" }}>master ASL.</span>
        </h1>
        <p className="text-muted" style={{ maxWidth: "600px", margin: "0 auto", fontSize: "var(--text-lg)" }}>
          SignSync combines cutting-edge AI with expert-designed curriculum to provide an unparalleled learning experience.
        </p>
      </header>

      {/* Main Features Grid */}
      <section className="container grid" style={{ marginBottom: "var(--space-20)" }}>
        <div className="card-outer">
          <div style={{ color: "var(--color-brand)", marginBottom: "var(--space-6)", background: "var(--color-brand-light)", width: "48px", height: "48px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center" }}>
            <Activity size={24} />
          </div>
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-3)" }}>Real-Time AI Tracking</h3>
          <p className="text-muted" style={{ lineHeight: 1.6 }}>
            Our neural network tracks your hand movements through your webcam in real-time, matching them against a vast database of fluent ASL gestures to give you instant feedback.
          </p>
        </div>

        <div className="card-outer">
          <div style={{ color: "var(--color-accent)", marginBottom: "var(--space-6)", background: "hsla(330, 80%, 60%, 0.1)", width: "48px", height: "48px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center" }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-3)" }}>100% Privacy Preserving</h3>
          <p className="text-muted" style={{ lineHeight: 1.6 }}>
            All video processing happens locally on your device. We never record, store, or transmit your camera feed to our servers. Your privacy is structurally guaranteed.
          </p>
        </div>

        <div className="card-outer">
          <div style={{ color: "var(--color-success)", marginBottom: "var(--space-6)", background: "hsla(160, 84%, 39%, 0.1)", width: "48px", height: "48px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center" }}>
            <Target size={24} />
          </div>
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-3)" }}>Contextual Curriculum</h3>
          <p className="text-muted" style={{ lineHeight: 1.6 }}>
            Learn ASL that you can actually use. From basic introductions to specialized modules for healthcare and emergency responders, learn the signs that matter.
          </p>
        </div>

        <div className="card-outer">
          <div style={{ color: "hsl(280, 84%, 60%)", marginBottom: "var(--space-6)", background: "hsla(280, 84%, 60%, 0.1)", width: "48px", height: "48px", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyCenter: "center", justifyContent: "center" }}>
            <Zap size={24} />
          </div>
          <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-3)" }}>Adaptive Difficulty</h3>
          <p className="text-muted" style={{ lineHeight: 1.6 }}>
            The platform adapts to your skill level. Struggling with a specific sign? The system will intelligently reintroduce it in future practice sessions to ensure mastery.
          </p>
        </div>
      </section>

      {/* Secondary Features */}
      <section className="container" style={{ background: "var(--color-overlay)", borderRadius: "var(--radius-xl)", padding: "var(--space-16)", marginBottom: "var(--space-20)", border: "1px solid var(--color-border)" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-12)" }}>
          <h2 style={{ fontSize: "var(--text-2xl)" }}>Built for serious learners</h2>
        </div>
        
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-8)" }}>
          <div className="flex flex-col items-center text-center">
            <Video size={32} color="var(--color-text-secondary)" style={{ marginBottom: "var(--space-4)" }} />
            <h4 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-2)" }}>Demo Loops</h4>
            <p className="text-muted text-sm">Watch high-quality, repeating visual demonstrations of every sign before practicing.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <History size={32} color="var(--color-text-secondary)" style={{ marginBottom: "var(--space-4)" }} />
            <h4 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-2)" }}>Progress Tracking</h4>
            <p className="text-muted text-sm">View detailed analytics of your accuracy and consistency over time.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Hand size={32} color="var(--color-text-secondary)" style={{ marginBottom: "var(--space-4)" }} />
            <h4 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-2)" }}>Fluidity Scoring</h4>
            <p className="text-muted text-sm">We don't just measure static poses, we score the natural fluidity of your motion.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Globe size={32} color="var(--color-text-secondary)" style={{ marginBottom: "var(--space-4)" }} />
            <h4 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-2)" }}>Browser Native</h4>
            <p className="text-muted text-sm">No downloads required. Access your courses from any modern web browser.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container" style={{ textAlign: "center", marginBottom: "var(--space-20)" }}>
        <h2 style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-6)" }}>Experience the future of ASL learning.</h2>
        <Link to="/register">
          <button style={{ padding: "var(--space-4) var(--space-10)", fontSize: "var(--text-lg)" }}>Start Free Trial</button>
        </Link>
      </section>
    </>
  );
}

export default Features;
