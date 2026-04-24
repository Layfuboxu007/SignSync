import { useState, useEffect } from "react";
import { supabase } from "../../api";
import { useNavigate } from "react-router-dom";

function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
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
      setErrorMsg("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
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
      
      setSuccessMsg("Password updated successfully! Redirecting...");
      await supabase.auth.signOut();
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (sessionError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div className="card-outer animate-fade-in" style={{ maxWidth: "440px", width: "100%", padding: "48px" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "8px" }}>Invalid Link</h2>
            <p className="text-sm" style={{ color: "#ef4444", marginBottom: "32px" }}>This password reset link is invalid or has expired.</p>
            <button onClick={() => navigate("/forgot-password")} style={{ width: "100%" }}>
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="card-outer animate-fade-in" style={{ maxWidth: "440px", width: "100%", padding: "48px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "8px" }}>Update Password</h2>
          <p className="text-muted text-sm">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleUpdate} style={{ textAlign: "left" }}>
          {errorMsg && (
            <div className="card-inner text-sm" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)", marginBottom: "24px" }}>
              Error: {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="card-inner text-sm" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)", marginBottom: "24px", textAlign: "center" }}>
              {successMsg}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
              NEW PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "32px" }}>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "var(--text-sm)" }}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;
