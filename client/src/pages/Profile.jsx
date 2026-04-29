import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API, supabase } from "../api";
import { useUserStore } from "../store/userStore";
import { User, Mail, Shield, ShieldCheck, ShieldAlert, Crown, Settings } from "lucide-react";
import { Alert } from "../components/common/Alert";
import { FormField } from "../components/common/FormField";

function Profile() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { logout, profile } = useUserStore();
  const isStudent = profile?.role === 'learner' || profile?.role === 'student';

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : profile?.username || "User";

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${(profile.last_name || "")[0] || ""}`.toUpperCase()
    : (profile?.username || "U")[0].toUpperCase();

  const [membershipLoading, setMembershipLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) setEmail(user.email);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };
    fetchUser();
  }, []);

  const handleUpgradeMembership = async () => {
    setMembershipLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const success = await useUserStore.getState().upgradeMembership();
      if (success) {
        setSuccessMsg("Membership activated successfully! You can now access all courses.");
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        setErrorMsg("Failed to activate membership. Please try again.");
      }
    } catch (err) {
      setErrorMsg("An error occurred while upgrading membership.");
    } finally {
      setMembershipLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      let updateData = {};
      if (email) updateData.email = email;
      if (newPassword) updateData.password = newPassword;

      const { data, error } = await supabase.auth.updateUser(updateData);
      if (error) throw error;

      if (data?.user) {
        await supabase.from("users").update({ email }).eq('id', data.user.id);
      }

      setSuccessMsg("Profile updated successfully!");
      setPassword("");
      setNewPassword("");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setDeleteLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await supabase.from('users').delete().eq('id', user.id);
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
    <div className="animate-fade-in" style={{ maxWidth: "640px" }}>
      {/* Profile Header */}
      <div className="card-outer" style={{ display: "flex", alignItems: "center", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "var(--radius-full)", flexShrink: 0,
          background: "linear-gradient(135deg, var(--color-brand) 0%, var(--color-brand-dark) 100%)",
          display: "flex", justifyContent: "center", alignItems: "center",
          color: "#fff", fontSize: "var(--text-xl)", fontWeight: "800", letterSpacing: "-0.02em"
        }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-1)" }}>{displayName}</h2>
          <p className="text-muted text-sm flex items-center gap-2">
            <Mail size={14} /> {email || "Loading..."}
          </p>
          <div style={{ marginTop: "var(--space-3)", display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
            <span className="badge" style={{ textTransform: "capitalize" }}>
              {profile?.role || "learner"}
            </span>
            {isStudent && (profile?.membership_status === 'member' ? (
              <span className="badge" style={{ background: "hsla(160, 84%, 39%, 0.1)", color: "var(--color-success)", borderColor: "hsla(160, 84%, 39%, 0.3)" }}>
                <ShieldCheck size={12} /> Active Member
              </span>
            ) : (
              <span className="badge" style={{ background: "var(--color-overlay)", color: "var(--color-text-muted)", borderColor: "var(--color-border)" }}>
                Free Tier
              </span>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && <Alert type="error">Error: {errorMsg}</Alert>}
      {successMsg && <Alert type="success">{successMsg}</Alert>}

      {/* Membership — students only */}
      {isStudent && profile?.membership_status !== 'member' && (
        <div className="card-outer" style={{ marginBottom: "var(--space-8)", display: "flex", alignItems: "center", gap: "var(--space-5)", background: "linear-gradient(135deg, var(--color-brand-light) 0%, var(--color-canvas) 100%)", borderColor: "var(--color-brand)" }}>
          <div style={{ color: "var(--color-brand)", flexShrink: 0 }}>
            <Crown size={32} strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-1)", color: "var(--color-brand-dark)" }}>Upgrade to Member</h3>
            <p className="text-muted text-sm">Unlock unlimited access to all courses and premium curriculum.</p>
          </div>
          <button 
            onClick={handleUpgradeMembership} 
            disabled={membershipLoading}
            style={{ width: "auto", flexShrink: 0 }}
          >
            {membershipLoading ? "Activating..." : "Activate"}
          </button>
        </div>
      )}

      {/* Account Settings Form */}
      <form onSubmit={handleUpdate}>
        <div className="card-outer" style={{ marginBottom: "var(--space-6)" }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-5)", color: "var(--color-text-primary)" }}>
            <Settings size={16} /> Account Settings
          </h3>
          <FormField label="EMAIL ADDRESS" id="profile-email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="card-outer" style={{ marginBottom: "var(--space-6)" }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-5)", color: "var(--color-text-primary)" }}>
            <Shield size={16} /> Security
          </h3>
          <FormField label="CURRENT PASSWORD" id="profile-current-pw" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          <FormField label="NEW PASSWORD" id="profile-new-pw" type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", marginBottom: "var(--space-8)" }}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Danger Zone — students only (admin cannot self-delete) */}
      {isStudent && (
        <div className="card-outer" style={{ borderColor: "hsla(0, 84%, 60%, 0.3)" }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-2)", color: "var(--color-danger)" }}>
            <ShieldAlert size={16} /> Danger Zone
          </h3>
          <p className="text-muted text-sm" style={{ marginBottom: "var(--space-5)" }}>
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleteLoading}
            style={{
              width: "100%",
              background: "hsla(0, 84%, 60%, 0.1)",
              color: "var(--color-danger)",
              border: "1px solid hsla(0, 84%, 60%, 0.3)"
            }}
          >
            {deleteLoading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;
