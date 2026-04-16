import { useState } from "react";
import { supabase } from "../api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("learner");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username: username,
            role: role
          }
        }
      });
      if (error) throw error;
      
      // Optionally sync to the public users table for backwards compatibility
      if (data?.user) {
        try {
          await API.post("/sync-user", {
             firstName,
             lastName,
             username,
             role,
             email
          });
        } catch (insertError) {
          console.error("Could not sync user profile:", insertError);
        }
      }

      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.message || "Registration failed");
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
          
          {errorMsg && (
            <div style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "24px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
            <div 
              onClick={() => setRole("learner")}
              style={{ flex: 1, padding: "16px", borderRadius: "12px", border: role === "learner" ? "2px solid var(--accent)" : "2px solid var(--border)", background: role === "learner" ? "var(--accent-bg)" : "transparent", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎓</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: role === "learner" ? "var(--accent)" : "var(--text)" }}>I am a Student</div>
            </div>
            <div 
              onClick={() => setRole("instructor")}
              style={{ flex: 1, padding: "16px", borderRadius: "12px", border: role === "instructor" ? "2px solid var(--accent)" : "2px solid var(--border)", background: role === "instructor" ? "var(--accent-bg)" : "transparent", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🧑‍🏫</div>
              <div style={{ fontSize: "14px", fontWeight: "600", color: role === "instructor" ? "var(--accent)" : "var(--text)" }}>I am an Instructor</div>
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>First Name</label>
              <input type="text" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: "var(--text-h)" }}>Last Name</label>
              <input type="text" placeholder="Doe" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          
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