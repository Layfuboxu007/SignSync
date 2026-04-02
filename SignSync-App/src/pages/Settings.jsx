import { useState } from "react";
import { Link } from "react-router-dom";

function Settings() {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [gender, setGender] = useState("prefer-not-to-say");
  const [loading, setLoading] = useState(false);

  const handleUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate update
    setTimeout(() => {
      alert("Settings updated successfully!");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="container" style={{ padding: "40px 24px" }}>
      <nav style={{ marginBottom: "40px" }}>
        <Link to="/home" style={{ display: "flex", alignItems: "center", gap: "8px", opacity: 0.8 }}>
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
            <h3 style={{ fontSize: "16px", marginBottom: "16px", opacity: 0.7 }}>Security</h3>
            <div className="input-group" style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px" }}>Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px" }}>New Password</label>
              <input 
                type="password" 
                placeholder="New password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="section" style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", opacity: 0.7 }}>Personal Info</h3>
            <div className="input-group">
              <label style={{ display: "block", marginBottom: "8px", fontSize: "12px" }}>Gender Identity</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "12px 16px", 
                  background: "rgba(255, 255, 255, 0.05)", 
                  border: "1px solid var(--panel-border)", 
                  borderRadius: "12px", 
                  color: "var(--text-h)",
                  outline: "none"
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Saving Changes..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;
