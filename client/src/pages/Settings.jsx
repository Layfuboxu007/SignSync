import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API, supabase } from "../api";
import { useUserStore } from "../store/userStore";
import { ArrowLeft, ShieldAlert } from "lucide-react";

function Settings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { logout } = useUserStore();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let updateData = {};
      if (email) updateData.email = email;
      if (newPassword) updateData.password = newPassword;
      
      const { data, error } = await supabase.auth.updateUser(updateData);
      if (error) throw error;
      
      if (data?.user) {
        await supabase.from("users").update({ email }).eq('id', data.user.id);
      }

      setSuccessMsg("Settings updated successfully!");
      setErrorMsg("");
      setPassword("");
      setNewPassword("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update settings");
      setSuccessMsg("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setDeleteLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
           await supabase.from('users').delete().eq('id', user.id);
        }
        await API.delete("/user");
        await logout();
        alert("Account deleted successfully.");
        navigate("/");
      } catch (err) {
        alert(err.message || "Failed to delete account");
        setDeleteLoading(false);
      }
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px", minHeight: "100vh" }}>
      <nav style={{ marginBottom: "40px" }}>
        <Link to="/dashboard" className="text-muted flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </nav>

      <div className="card-outer animate-fade-in" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left", padding: "48px" }}>
        <div style={{ marginBottom: "40px" }}>
          <h2 style={{ fontSize: "var(--text-xl)", marginBottom: "8px" }}>Account Settings</h2>
          <p className="text-muted text-sm">Update your profile and security preferences.</p>
        </div>

        {errorMsg && (
          <div className="card-inner text-sm" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)", marginBottom: "24px" }}>
            Error: {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="card-inner text-sm" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderColor: "rgba(16, 185, 129, 0.3)", marginBottom: "24px" }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "var(--text-md)", marginBottom: "16px", color: "var(--color-text-primary)" }}>Personal Information</h3>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "var(--text-xs)", fontWeight: "600", color: "var(--color-text-muted)" }}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "var(--text-md)", marginBottom: "16px", color: "var(--color-text-primary)" }}>Security</h3>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "var(--text-xs)", fontWeight: "600", color: "var(--color-text-muted)" }}>CURRENT PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-muted" style={{ fontSize: "var(--text-xs)", marginTop: "6px" }}>Required to safely change your password.</p>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "var(--text-xs)", fontWeight: "600", color: "var(--color-text-muted)" }}>NEW PASSWORD</label>
              <input 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </form>

        <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid var(--color-border)" }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: "var(--text-md)", marginBottom: "8px", color: "#ef4444" }}>
             <ShieldAlert size={18} /> Danger Zone
          </h3>
          <p className="text-muted text-sm" style={{ marginBottom: "20px" }}>
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <button 
            type="button" 
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            style={{ 
              width: "100%",
              background: "rgba(239, 68, 68, 0.1)", 
              color: "#ef4444", 
              border: "1px solid rgba(239, 68, 68, 0.3)" 
            }}
          >
            {deleteLoading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
