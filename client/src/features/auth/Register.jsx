import { useState } from "react";
import { supabase, API } from "../../api";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, GraduationCap as Teacher } from "lucide-react";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("learner");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

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

      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div className="card-outer animate-fade-in" style={{ maxWidth: "540px", width: "100%", padding: "48px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "8px" }}>Create Free Account</h2>
          <p className="text-muted text-sm">Start your journey to visual fluency today.</p>
        </div>

        <form onSubmit={handleRegister} style={{ textAlign: "left" }}>
          
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

          <div style={{ display: "flex", gap: "16px", marginBottom: "32px" }}>
            <div 
              onClick={() => setRole("learner")}
              style={{ flex: 1, padding: "20px", borderRadius: "var(--radius-md)", border: role === "learner" ? "2px solid var(--color-brand)" : "2px solid var(--color-border)", background: role === "learner" ? "var(--color-brand-light)" : "var(--color-surface)", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
            >
              <div className="flex justify-center" style={{ marginBottom: "12px", color: role === "learner" ? "var(--color-brand)" : "var(--color-text-muted)" }}><GraduationCap size={28} strokeWidth={1.5}/></div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: role === "learner" ? "var(--color-brand-dark)" : "var(--color-text-secondary)" }}>Learner Account</div>
            </div>
            <div 
              onClick={() => setRole("instructor")}
              style={{ flex: 1, padding: "20px", borderRadius: "var(--radius-md)", border: role === "instructor" ? "2px solid var(--color-brand)" : "2px solid var(--color-border)", background: role === "instructor" ? "var(--color-brand-light)" : "var(--color-surface)", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
            >
              <div className="flex justify-center" style={{ marginBottom: "12px", color: role === "instructor" ? "var(--color-brand)" : "var(--color-text-muted)" }}><Teacher size={28} strokeWidth={1.5}/></div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: role === "instructor" ? "var(--color-brand-dark)" : "var(--color-text-secondary)" }}>Instructor Account</div>
            </div>
          </div>
          
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>FIRST NAME</label>
              <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>LAST NAME</label>
              <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>USERNAME</label>
            <input type="text" placeholder="Pick a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>EMAIL ADDRESS</label>
            <input type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>PASSWORD</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "700", marginBottom: "8px", color: "var(--color-text-muted)", letterSpacing: "0.05em" }}>CONFIRM PASSWORD</label>
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "16px", fontSize: "var(--text-sm)" }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <p className="text-muted text-sm">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;