import { useUserStore } from "../../store/userStore";
import { Layers, Wrench } from "lucide-react";

/**
 * Instructor Dashboard — Placeholder
 * 
 * The Instructor role and its RBAC infrastructure are correctly built,
 * but the content editor UI has not been implemented yet.
 * Courses are currently seeded via server/src/scripts/seed_curriculum.js.
 * 
 * Planned functionality:
 * - Visual curriculum editor (drag-and-drop module ordering)
 * - Upload demo/correction videos per sign
 * - Define gesture sequences per module
 * - Set mastery thresholds per course
 * - View per-course student engagement metrics
 */
function InstructorDashboard() {
  const { profile } = useUserStore();
  const currentUser = profile?.first_name || profile?.username || "Instructor";

  return (
    <div className="animate-fade-in" style={{ maxWidth: "640px", margin: "0 auto", padding: "var(--space-20) var(--space-5)", textAlign: "center" }}>
      <div style={{ width: "80px", height: "80px", margin: "0 auto var(--space-6)", borderRadius: "50%", background: "var(--color-brand-light)", color: "var(--color-brand)", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Wrench size={32} />
      </div>
      
      <h1 style={{ fontSize: "var(--text-xl)", marginBottom: "var(--space-2)" }}>Hello, {currentUser}</h1>
      <p className="text-muted" style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-8)" }}>
        Instructor Dashboard
      </p>

      <div className="card-outer" style={{ textAlign: "left" }}>
        <div className="badge flex items-center gap-2" style={{ marginBottom: "var(--space-5)", background: "hsla(280, 84%, 60%, 0.1)", color: "hsl(280, 84%, 60%)", borderColor: "hsla(280, 84%, 60%, 0.3)" }}>
          <Layers size={14} /> Content Editor — Coming Soon
        </div>
        
        <h3 style={{ fontSize: "var(--text-md)", marginBottom: "var(--space-3)" }}>
          What's being built
        </h3>
        <ul style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "1.8", paddingLeft: "20px" }}>
          <li>Visual curriculum editor with drag-and-drop module ordering</li>
          <li>Upload demo and correction videos per sign</li>
          <li>Define gesture sequences and mastery thresholds</li>
          <li>Per-course student engagement metrics and drop-off analysis</li>
        </ul>
        
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", marginTop: "var(--space-6)", borderTop: "1px solid var(--color-border)", paddingTop: "var(--space-4)" }}>
          Curriculum is currently managed via the admin seed script. Contact your system administrator to update course content.
        </p>
      </div>
    </div>
  );
}

export default InstructorDashboard;
