import { useState } from "react";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { Alert } from "../components/common/Alert";
import { FormField } from "../components/common/FormField";

function Contact() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      e.target.reset();
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <>
      {/* Hero Section */}
      <header className="container" style={{ textAlign: "center", paddingTop: "var(--space-20)", paddingBottom: "var(--space-12)" }}>
        <div className="badge flex items-center gap-2 justify-center" style={{ margin: "0 auto var(--space-6)", width: "max-content" }}>
          Get In Touch
        </div>
        <h1 style={{ fontSize: "var(--text-4xl)", marginBottom: "var(--space-6)" }}>
          We're here to help you <br/><span style={{ color: "var(--color-brand)" }}>sync up.</span>
        </h1>
        <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto", fontSize: "var(--text-lg)" }}>
          Have questions about the platform, enterprise pricing, or ASL curriculum? Reach out to our team.
        </p>
      </header>

      {/* Contact Section */}
      <section className="container" style={{ marginBottom: "var(--space-20)", display: "flex", flexWrap: "wrap", gap: "var(--space-10)" }}>
        
        {/* Contact Info Cards */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div className="card-outer flex items-start gap-4">
            <div style={{ color: "var(--color-brand)", background: "var(--color-brand-light)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)" }}>
              <Mail size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-1)" }}>Email Us</h3>
              <p className="text-muted text-sm mb-2">For general inquiries and support.</p>
              <a href="mailto:hello@signsync.ai" style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>hello@signsync.ai</a>
            </div>
          </div>
          
          <div className="card-outer flex items-start gap-4">
            <div style={{ color: "var(--color-accent)", background: "hsla(330, 80%, 60%, 0.1)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)" }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-1)" }}>Community Support</h3>
              <p className="text-muted text-sm mb-2">Join our Discord to ask questions and practice.</p>
              <a href="#" style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>Join Server →</a>
            </div>
          </div>

          <div className="card-outer flex items-start gap-4">
            <div style={{ color: "var(--color-success)", background: "hsla(160, 84%, 39%, 0.1)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)" }}>
              <MapPin size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-1)" }}>Headquarters</h3>
              <p className="text-muted text-sm mb-2">We are fully remote, but our HQ is based in:</p>
              <span style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>San Francisco, CA</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card-outer" style={{ flex: "2 1 400px", padding: "var(--space-8)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-6)" }}>Send a Message</h2>
          
          {success && (
            <div style={{ marginBottom: "var(--space-6)" }}>
              <Alert type="success">Your message has been sent successfully. We will get back to you shortly!</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
              <FormField label="FIRST NAME" id="contact-first" type="text" placeholder="Jane" required />
              <FormField label="LAST NAME" id="contact-last" type="text" placeholder="Doe" required />
            </div>
            
            <FormField label="EMAIL ADDRESS" id="contact-email" type="email" placeholder="jane@example.com" required />
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
              <label htmlFor="contact-subject" style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>SUBJECT</label>
              <select id="contact-subject" className="card-inner" style={{ width: "100%", padding: "var(--space-3)", fontSize: "var(--text-sm)", background: "var(--color-surface)", border: "1px solid var(--color-border)" }} required>
                <option value="">Select a topic...</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing & Membership</option>
                <option value="enterprise">Enterprise/School Licensing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-8)" }}>
              <label htmlFor="contact-message" style={{ fontSize: "var(--text-xs)", fontWeight: "700", color: "var(--color-text-secondary)", letterSpacing: "0.05em" }}>MESSAGE</label>
              <textarea 
                id="contact-message" 
                rows="5" 
                placeholder="How can we help you?"
                required
                style={{
                  width: "100%", padding: "var(--space-3)", fontSize: "var(--text-sm)", 
                  background: "var(--color-surface)", border: "1px solid var(--color-border)", 
                  borderRadius: "var(--radius-md)", color: "var(--color-text-primary)", resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--space-2)" }}>
              {loading ? "Sending..." : <><Send size={16} /> Send Message</>}
            </button>
          </form>
        </div>

      </section>
    </>
  );
}

export default Contact;
