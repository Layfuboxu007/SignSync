import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../api";

function Settings() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/user/me");
        if (data.email) {
          setEmail(data.email);
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
      await API.put("/user", { email, password, newPassword });
      alert("Settings updated successfully!");
      setPassword("");
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setDeleteLoading(true);
      try {
        await API.delete("/user");
        alert("Account deleted successfully.");
        localStorage.removeItem("token");
        navigate("/");
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete account");
        setDeleteLoading(false);
      }
    }
  };

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <nav style={{ marginBottom: "40px" }}>
        <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.8 }}>
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="auth-card glass" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "left" }}>
        <div className="auth-header">
          <h2>User Settings</h2>
          <p>Update your profile and security preferences</p>
        </div>

        <form className="auth-form" onSubmit={handleUpdate}>
          <div className="section" style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", opacity: 0.7 }}>Personal Info</h3>
            <div className="input-group" style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "var(--text-h)" }}>Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="section" style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", opacity: 0.7 }}>Security</h3>
            <div className="input-group" style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "var(--text-h)" }}>Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p style={{ fontSize: "12px", opacity: 0.5, marginTop: "4px" }}>Required to change your password.</p>
            </div>
            <div className="input-group">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "var(--text-h)" }}>New Password</label>
              <input 
                type="password" 
                placeholder="New password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving Changes..." : "Save Settings"}
          </button>
        </form>

        <div className="section" style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid rgba(255,0,0,0.2)" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "#ff4d4f" }}>Danger Zone</h3>
          <p style={{ fontSize: "14px", opacity: 0.7, marginBottom: "16px" }}>
            Permanently delete your account and all associated data.
          </p>
          <button 
            type="button" 
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            style={{ 
              background: "rgba(255, 77, 79, 0.1)", 
              color: "#ff4d4f", 
              border: "1px solid rgba(255, 77, 79, 0.3)" 
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
