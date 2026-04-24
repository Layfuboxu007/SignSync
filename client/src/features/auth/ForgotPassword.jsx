import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase, API } from "../../api";

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
      let targetEmail = email;
      
      if (!targetEmail.includes('@')) {
         try {
           const res = await API.post("/lookup-email", { username: email });
           targetEmail = res.data.email;
         } catch {
           throw new Error("Username not found");
         }
      }
      
      const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="card-outer animate-fade-in" style={{ maxWidth: "440px", width: "100%", padding: "48px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "8px" }}>Reset Password</h2>
          <p className="text-muted text-sm">
            {submitted 
              ? "Check your inbox for reset instructions" 
              : "Enter your username or email to recover your account"}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
            {errorMsg && (
              <div className="card-inner text-sm" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)", marginBottom: "24px" }}>
                Error: {errorMsg}
              </div>
            )}
            
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
                USERNAME OR EMAIL
              </label>
              <input
                type="text"
                placeholder="Enter your username or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "var(--text-sm)" }}>
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <button className="secondary" onClick={() => setSubmitted(false)} style={{ width: "100%" }}>
            Back to Reset
          </button>
        )}

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <p className="text-muted text-sm">
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
