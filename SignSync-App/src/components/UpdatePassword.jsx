import { useState, useEffect } from "react";
import { supabase } from "../api";
import { useNavigate } from "react-router-dom";

function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user session was securely established by the email link
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!data.session) {
        setSessionError(true);
      }
    };
    checkSession();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      setErrorMsg("Password must be at least 8 characters, with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      alert("Password updated successfully! Redirecting to login...");
      await supabase.auth.signOut();
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (sessionError) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: "500px" }}>
          <div className="auth-header">
            <h2>Invalid Link</h2>
            <p style={{ color: "#ef4444" }}>This password reset link is invalid or has expired.</p>
            <button onClick={() => navigate("/forgot-password")} style={{ marginTop: "24px" }}>
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: "500px" }}>
        <div className="auth-header">
          <h2>Update Password</h2>
          <p>Please enter your new password below.</p>
        </div>

        <form className="auth-form" onSubmit={handleUpdate} style={{ textAlign: "left" }}>
          {errorMsg && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{ padding: "14px" }}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;
