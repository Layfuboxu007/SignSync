import React, { useState } from "react";
import { useUserStore } from "../../store/userStore";
import { API } from "../../api";
import { ShieldCheck, Mail, Lock, KeyRound } from "lucide-react";

export default function AdminProfile() {
  const { profile } = useUserStore();
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!profile) return null;

  const initials = (profile.first_name?.[0] || profile.username?.[0] || "?").toUpperCase();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setErrorMsg("New passwords do not match.");
    }
    if (passwordData.newPassword.length < 6) {
      return setErrorMsg("Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      await API.put("/users/update-password", {
        password: passwordData.newPassword
      });
      setSuccessMsg("Password updated successfully.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 200ms ease",
    fontFamily: "'Fira Sans', sans-serif"
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "4px", fontWeight: "700" }}>Command Center Identity</h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>Manage your administrative credentials and security settings.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Identity Card */}
        <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ 
            width: "80px", height: "80px", borderRadius: "20px",
            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", fontWeight: "700", color: "#ffffff",
            boxShadow: "0 4px 6px rgba(59, 130, 246, 0.2)"
          }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#0f172a", marginBottom: "4px" }}>
              {profile.first_name} {profile.last_name}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "14px", fontFamily: "'Fira Code', monospace" }}>
                <Mail size={14} color="#94a3b8" /> {profile.email}
              </span>
              <span style={{ 
                display: "flex", alignItems: "center", gap: "6px",
                padding: "4px 10px", borderRadius: "6px",
                background: "#eff6ff", color: "#2563eb", 
                border: "1px solid #bfdbfe",
                fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em"
              }}>
                <ShieldCheck size={14} /> {profile.role}
              </span>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Lock size={20} color="#2563eb" /> Security Settings
          </h3>

          {errorMsg && (
            <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", color: "#ef4444", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ padding: "12px 16px", background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#10b981", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>New Password</label>
                <input 
                  type="password" 
                  style={inputStyle}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Confirm Password</label>
                <input 
                  type="password" 
                  style={inputStyle}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
              <button 
                type="submit" 
                disabled={loading || !passwordData.newPassword}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: (loading || !passwordData.newPassword) ? "#f1f5f9" : "#2563eb",
                  color: (loading || !passwordData.newPassword) ? "#94a3b8" : "#ffffff",
                  border: "none", padding: "12px 24px", borderRadius: "8px",
                  fontSize: "14px", fontWeight: "600", cursor: (loading || !passwordData.newPassword) ? "not-allowed" : "pointer",
                  transition: "all 200ms ease",
                  boxShadow: (loading || !passwordData.newPassword) ? "none" : "0 4px 6px rgba(37, 99, 235, 0.2)"
                }}
              >
                <KeyRound size={16} /> {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
