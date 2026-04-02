import { useState } from "react";
import { API } from "../api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    setLoading(true);
    try {
      await API.post("/register", { username, email, password });
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: "500px" }}>
        <div className="auth-header">
          <h2>Create Free Account</h2>
          <p>Start your journey to visual fluency today.</p>
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

        <form className="auth-form" onSubmit={handleRegister} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Pick a unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            <div>
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
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>
                Confirm
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ padding: "14px" }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "32px" }}>
          <p style={{ fontSize: "14px" }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;