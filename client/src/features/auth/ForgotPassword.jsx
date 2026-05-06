import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../api";
import { Alert } from "../../components/common/Alert";
import { FormField } from "../../components/common/FormField";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    try {
      // Only accept email addresses — no username resolution.
      // This prevents the old enumeration vector via /lookup-email.
      if (!email.includes('@')) {
        throw new Error("Please enter your email address, not your username.");
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/update-password"
      });
      
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-5)" }}>
      <div className="card-outer animate-fade-in" style={{ maxWidth: "440px", width: "100%", padding: "var(--space-12)" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>Reset Password</h2>
          <p className="text-muted text-sm">
            {submitted 
              ? "Check your inbox for reset instructions" 
              : "Enter your email address to recover your account"}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
            {errorMsg && <Alert type="error">Error: {errorMsg}</Alert>}
            
            <FormField
              label="EMAIL ADDRESS"
              id="forgot-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "var(--text-sm)" }}>
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <button className="secondary" onClick={() => setSubmitted(false)} style={{ width: "100%" }}>
            Back to Reset
          </button>
        )}

        <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
          <p className="text-muted text-sm">
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
