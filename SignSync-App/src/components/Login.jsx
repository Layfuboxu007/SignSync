import { useState } from "react";
import { supabase, API } from "../api";
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
      setErrorMsg("Please enter both your username and password.");
      return;
    }

    setLoading(true);
    try {
      let loginEmail = username;
      
      // If no @ symbol, assume it's a username and lookup the email
      if (!loginEmail.includes('@')) {
         try {
           const res = await API.post("/lookup-email", { username });
           loginEmail = res.data.email;
         } catch (e) {
           throw new Error(e.response?.data?.error || e.message || "Username not found");
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
      setErrorMsg(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: "500px" }}>
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in.</p>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          <button className="secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flex: 1 }}>
            <img src="https://img.icons8.com/color/24/000000/google-logo.png" alt="Google" style={{ width: "18px" }} />
            Google
          </button>
          <button className="secondary" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flex: 1 }}>
            <img src="https://img.icons8.com/ios-filled/24/000000/mac-os.png" alt="Apple" style={{ width: "18px" }} />
            Apple
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0", opacity: 0.3 }}>
          <hr style={{ flex: 1, border: "0.5px solid var(--border)" }} />
          <span style={{ fontSize: "12px", fontWeight: "600" }}>OR</span>
          <hr style={{ flex: 1, border: "0.5px solid var(--border)" }} />
        </div>

        <form className="auth-form" onSubmit={handleLogin} style={{ textAlign: "left" }}>
          {errorMsg && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>
              Username or Email
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
              <input type="checkbox" style={{ width: "16px", height: "16px" }} />
              Remember for 30 days
            </label>
            <Link to="/forgot-password" style={{ fontSize: "14px" }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading} style={{ padding: "14px" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "32px" }}>
          <p style={{ fontSize: "14px" }}>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;