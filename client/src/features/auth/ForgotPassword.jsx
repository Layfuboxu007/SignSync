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
      
      // If no @ symbol, assume it's a username and lookup the email
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
    <div className="auth-page">
      <div className="auth-card glass" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>
            {submitted 
              ? "Check your inbox for reset instructions" 
              : "Enter your username or email to recover your account"}
          </p>
        </div>

        {!submitted ? (
          <form className="auth-form" onSubmit={handleSubmit}>
            {errorMsg && (
              <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                ⚠️ {errorMsg}
              </div>
            )}
            
            <div className="input-group">
              <input
                type="text"
                placeholder="Username or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <button onClick={() => setSubmitted(false)}>
            Back to Reset
          </button>
        )}

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
