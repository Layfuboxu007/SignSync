import { useState } from "react";
import { supabase, API } from "../../api";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password) {
      setErrorMsg("Please enter both your email/username and password.");
      return;
    }

    setLoading(true);
    try {
      let loginEmail = username;
      
      if (!loginEmail.includes('@')) {
         try {
           const res = await API.post("/lookup-email", { username });
           loginEmail = res.data.email;
         } catch (e) {
           throw new Error(e.response?.data?.error || e.message || "Username not found in system");
         }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password
      });
      
      if (error) throw error;
      const { data: dbData } = await API.get("/user/me");
      if (dbData?.data?.role === "instructor" || dbData?.role === "instructor") {
        navigate("/instructor/dashboard");
      } else {
        if (localStorage.getItem("onboardingComplete")) {
          navigate("/dashboard");
        } else {
          navigate("/start");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="card-outer animate-fade-in" style={{ maxWidth: "440px", width: "100%", padding: "48px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "8px" }}>Welcome Back</h2>
          <p className="text-muted text-sm">Please sign in to access your dashboard.</p>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button className="secondary" style={{ flex: 1, padding: "10px" }}>
            <span style={{ fontSize: "14px" }}>Google</span>
          </button>
          <button className="secondary" style={{ flex: 1, padding: "10px" }}>
            <span style={{ fontSize: "14px" }}>Apple</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
          <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--color-border)" }} />
          <span className="text-muted" style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em" }}>OR</span>
          <hr style={{ flex: 1, border: "0", borderTop: "1px solid var(--color-border)" }} />
        </div>

        <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
          {errorMsg && (
            <div className="card-inner text-sm" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)", marginBottom: "24px" }}>
              Error: {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
              USERNAME OR EMAIL
            </label>
            <input
              type="text"
              placeholder="Your username or email address"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <label className="text-muted flex items-center gap-2" style={{ fontSize: "var(--text-xs)", cursor: "pointer", fontWeight: "500" }}>
              <input type="checkbox" style={{ width: "16px", height: "16px", accentColor: "var(--color-brand)" }} />
              Remember me
            </label>
            <Link to="/forgot-password" style={{ fontSize: "var(--text-xs)" }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", fontSize: "var(--text-sm)" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <p className="text-muted text-sm">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;