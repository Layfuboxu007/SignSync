import { useState, useEffect } from "react";
import { supabase } from "../../api";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../components/common/Alert";
import { FormField } from "../../components/common/FormField";

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
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-5)" }}>
        <div className="card-outer animate-fade-in" style={{ maxWidth: "440px", width: "100%", padding: "var(--space-12)" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>Invalid Link</h2>
            <p className="text-sm" style={{ color: "var(--color-danger)", marginBottom: "var(--space-8)" }}>This password reset link is invalid or has expired.</p>
            <button onClick={() => navigate("/forgot-password")} style={{ width: "100%" }}>
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-5)" }}>
      <div className="card-outer animate-fade-in" style={{ maxWidth: "440px", width: "100%", padding: "var(--space-12)" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>Update Password</h2>
          <p className="text-muted text-sm">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleUpdate} style={{ textAlign: "left" }}>
          {errorMsg && <Alert type="error">Error: {errorMsg}</Alert>}
          {successMsg && <Alert type="success">{successMsg}</Alert>}

          <FormField
            label="NEW PASSWORD"
            id="update-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <FormField
            label="CONFIRM PASSWORD"
            id="update-confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "var(--text-sm)", marginTop: "var(--space-4)" }}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UpdatePassword;
