import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useUserStore } from "../../store/userStore";
import { Alert } from "../../components/common/Alert";
import { FormField } from "../../components/common/FormField";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth();
  const { profile, session } = useUserStore();

  useEffect(() => {
    if (session) {
      if (profile?.role === "admin") navigate("/admin");
      else if (profile?.role === "instructor") navigate("/instructor/dashboard");
      else navigate("/dashboard");
    }
  }, [session, profile, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both your email/username and password.");
      return;
    }

    const res = await login(username, password);
    if (res.success) {
      if (res.role === "admin") {
        navigate("/admin");
      } else if (res.role === "instructor") {
        navigate("/instructor/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-5)" }}>
      <div className="card-outer animate-fade-in" style={{ maxWidth: "440px", width: "100%", padding: "var(--space-12)" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>Welcome Back</h2>
          <p className="text-muted text-sm">Please sign in to access your dashboard.</p>
        </div>

        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          {error && <Alert type="error">Error: {error}</Alert>}

          <FormField
            label="USERNAME OR EMAIL"
            id="login-username"
            type="text"
            placeholder="Your username or email address"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <FormField
            label="PASSWORD"
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "var(--space-8)" }}>
            <Link to="/forgot-password" style={{ fontSize: "var(--text-xs)" }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "var(--text-sm)" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
          <p className="text-muted text-sm">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;