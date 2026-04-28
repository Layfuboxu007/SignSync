import React, { useEffect, useState } from "react";
import { Users, Activity, BarChart2, AlertCircle } from "lucide-react";
import { API } from "../../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from "recharts";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [overviewRes, engagementRes] = await Promise.all([
          API.get("/api/admin/metrics/overview"),
          API.get("/api/admin/metrics/engagement")
        ]);

        // Process data for charts
        const rawMetrics = overviewRes.data.recentMetrics || [];
        const formattedMetrics = rawMetrics.reverse().map(m => ({
          name: new Date(m.report_date).toLocaleDateString('en-US', { weekday: 'short' }),
          ActiveUsers: m.daily_active_users,
          Failures: m.total_tracker_failures
        }));

        setMetrics({
          totalUsers: overviewRes.data.totalUsers,
          chartData: formattedMetrics
        });

        setEngagement(engagementRes.data.difficultModules);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted">Loading Analytics Engine...</div>;
  if (error) return <div className="p-8 text-center" style={{ color: "var(--color-danger)" }}>Error: {error}</div>;

  const currentActive = metrics.chartData.length > 0 ? metrics.chartData[metrics.chartData.length - 1].ActiveUsers : 0;
  const currentFailures = metrics.chartData.length > 0 ? metrics.chartData[metrics.chartData.length - 1].Failures : 0;

  return (
    <div className="animate-fade-in" style={{ padding: "var(--space-6) var(--space-8)", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1 style={{ fontSize: "var(--text-2xl)", color: "var(--color-brand-dark)", marginBottom: "var(--space-1)", fontFamily: "Fira Code, monospace" }}>System Analytics</h1>
        <p className="text-muted text-sm">Real-time overview of platform usage and AI tracker performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        <div className="card-outer flex items-center gap-4">
          <div style={{ background: "hsla(220, 84%, 40%, 0.1)", color: "#1E40AF", padding: "var(--space-3)", borderRadius: "var(--radius-lg)" }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-muted text-xs font-semibold">TOTAL USERS</p>
            <h2 style={{ fontSize: "var(--text-xl)", fontFamily: "Fira Code, monospace" }}>{metrics.totalUsers}</h2>
          </div>
        </div>
        
        <div className="card-outer flex items-center gap-4">
          <div style={{ background: "hsla(160, 84%, 39%, 0.1)", color: "var(--color-success)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)" }}>
            <Activity size={24} />
          </div>
          <div>
            <p className="text-muted text-xs font-semibold">ACTIVE SESSIONS (TODAY)</p>
            <h2 style={{ fontSize: "var(--text-xl)", fontFamily: "Fira Code, monospace" }}>{currentActive}</h2>
          </div>
        </div>

        <div className="card-outer flex items-center gap-4">
          <div style={{ background: "hsla(0, 84%, 60%, 0.1)", color: "var(--color-danger)", padding: "var(--space-3)", borderRadius: "var(--radius-lg)" }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-muted text-xs font-semibold">TRACKER FAILURES (TODAY)</p>
            <h2 style={{ fontSize: "var(--text-xl)", fontFamily: "Fira Code, monospace" }}>{currentFailures}</h2>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: "var(--space-6)" }}>
        <div className="card-outer">
          <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-6)", display: "flex", alignItems: "center", gap: "8px" }}>
            <BarChart2 size={18} /> Daily Active Users (7D)
          </h3>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <LineChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
                <Tooltip 
                  contentStyle={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
                  itemStyle={{ fontFamily: "Fira Code, monospace" }}
                />
                <Line type="monotone" dataKey="ActiveUsers" stroke="#1E40AF" strokeWidth={3} dot={{ r: 4, fill: "#1E40AF", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-outer">
          <h3 style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-6)", display: "flex", alignItems: "center", gap: "8px", color: "var(--color-warning)" }}>
            <AlertCircle size={18} /> Most Difficult Modules
          </h3>
          <p className="text-xs text-muted mb-4">Based on AI tracking failure threshold interventions (Last 30 Days).</p>
          <div style={{ height: "260px", width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={engagement || []} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-text-muted)" }} />
                <YAxis dataKey="module_name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--color-text-primary)" }} width={120} />
                <Tooltip 
                  cursor={{ fill: "var(--color-overlay)" }}
                  contentStyle={{ background: "var(--color-canvas)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}
                  itemStyle={{ fontFamily: "Fira Code, monospace" }}
                />
                <Bar dataKey="failure_count" name="Failures" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
