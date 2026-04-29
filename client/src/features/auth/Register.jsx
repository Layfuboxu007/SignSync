import { useState, useEffect } from "react";
import { supabase, API } from "../../api";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap, Briefcase } from "lucide-react";
import { Alert } from "../../components/common/Alert";
import { FormField } from "../../components/common/FormField";
import { useUserStore } from "../../store/userStore";

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
  const { profile, session } = useUserStore();

  useEffect(() => {
    if (session) {
      if (profile?.role === "admin") navigate("/admin");
      else if (profile?.role === "instructor") navigate("/instructor/dashboard");
      else navigate("/dashboard");
    }
  }, [session, profile, navigate]);

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
          await API.post("/users/sync", {
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
      setTimeout(() => {
        if (role === "instructor") {
          navigate("/instructor/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-10) var(--space-5)" }}>
      <div className="card-outer animate-fade-in" style={{ maxWidth: "540px", width: "100%", padding: "var(--space-12)" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>Create Free Account</h2>
          <p className="text-muted text-sm">Start your journey to visual fluency today.</p>
        </div>

        <form onSubmit={handleRegister} style={{ textAlign: "left" }}>
          {errorMsg && <Alert type="error">Error: {errorMsg}</Alert>}
          {successMsg && <Alert type="success">{successMsg}</Alert>}

          <div style={{ display: "flex", gap: "var(--space-4)", marginBottom: "var(--space-8)" }}>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setRole("learner")}
              onKeyDown={(e) => e.key === 'Enter' && setRole("learner")}
              className="card-inner card-interactive"
              style={{
                flex: 1, padding: "var(--space-5)", textAlign: "center",
                background: role === "learner" ? "var(--color-brand-light)" : "var(--color-overlay)",
                borderColor: role === "learner" ? "var(--color-brand)" : "var(--color-border)",
                borderWidth: "2px"
              }}
            >
              <div className="flex justify-center" style={{ marginBottom: "var(--space-3)", color: role === "learner" ? "var(--color-brand)" : "var(--color-text-muted)" }}><GraduationCap size={28} strokeWidth={1.5}/></div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: role === "learner" ? "var(--color-brand-dark)" : "var(--color-text-secondary)" }}>Learner Account</div>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setRole("instructor")}
              onKeyDown={(e) => e.key === 'Enter' && setRole("instructor")}
              className="card-inner card-interactive"
              style={{
                flex: 1, padding: "var(--space-5)", textAlign: "center",
                background: role === "instructor" ? "var(--color-brand-light)" : "var(--color-overlay)",
                borderColor: role === "instructor" ? "var(--color-brand)" : "var(--color-border)",
                borderWidth: "2px"
              }}
            >
              <div className="flex justify-center" style={{ marginBottom: "var(--space-3)", color: role === "instructor" ? "var(--color-brand)" : "var(--color-text-muted)" }}><Briefcase size={28} strokeWidth={1.5}/></div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: "600", color: role === "instructor" ? "var(--color-brand-dark)" : "var(--color-text-secondary)" }}>Instructor Account</div>
            </div>
          </div>
          
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="FIRST NAME" id="reg-first-name" type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            <FormField label="LAST NAME" id="reg-last-name" type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          
          <FormField label="USERNAME" id="reg-username" type="text" placeholder="Pick a username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <FormField label="EMAIL ADDRESS" id="reg-email" type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--space-4)" }}>
            <FormField label="PASSWORD" id="reg-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <FormField label="CONFIRM PASSWORD" id="reg-confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: "var(--space-4)", fontSize: "var(--text-sm)", marginTop: "var(--space-4)" }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: "var(--space-8)", textAlign: "center" }}>
          <p className="text-muted text-sm">
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;