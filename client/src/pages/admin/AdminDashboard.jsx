import React from "react";
import { Users, Activity, BarChart2, AlertCircle } from "lucide-react";
import { useAdmin } from "../../hooks/useAdmin";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell
} from "recharts";

// Custom Light Mode Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        border: "1px solid #e2e8f0",
        padding: "12px",
        borderRadius: "8px",
        color: "#0f172a",
        fontFamily: "'Fira Code', monospace",
        fontSize: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
      }}>
        <p style={{ color: "#64748b", marginBottom: "4px" }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color, fontWeight: "600" }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
  transition: "transform 200ms ease, box-shadow 200ms ease",
  cursor: "pointer"
};

const hoverIn = (e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
  e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)";
};
const hoverOut = (e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)";
};

function KpiCard({ icon: Icon, label, value, bgColor, iconColor, gridSpan = 4 }) {
  return (
    <div
      style={{ ...cardStyle, gridColumn: `span ${gridSpan}` }}
      onMouseOver={hoverIn}
      onMouseOut={hoverOut}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div style={{ background: bgColor, color: iconColor, padding: "16px", borderRadius: "12px" }}>
          <Icon size={28} />
        </div>
        <div>
          <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em", marginBottom: "4px" }}>{label}</p>
          <h2 style={{ fontSize: "32px", color: "#0f172a", fontFamily: "'Fira Code', monospace", fontWeight: "700", lineHeight: 1 }}>{value}</h2>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { metrics, engagement, loading, error, currentActive, currentFailures } = useAdmin();

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>
      <div style={{ display: "inline-block", padding: "16px", borderRadius: "16px", background: "#ffffff", border: "1px solid #e2e8f0" }}>
        <Activity size={24} color="#2563eb" className="animate-pulse mb-2 mx-auto" />
        Loading Telemetry Engine...
      </div>
    </div>
  );
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>Error: {error}</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "4px", fontWeight: "700" }}>System Analytics</h1>
        <p style={{ color: "#64748b", fontSize: "14px" }}>Real-time overview of platform usage and AI tracker performance.</p>
      </div>

      {/* Bento Grid layout */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "24px", marginBottom: "24px" }}>
        
        <KpiCard icon={Users} label="TOTAL USERS" value={metrics.totalUsers} bgColor="#eff6ff" iconColor="#2563eb" />
        <KpiCard icon={Activity} label="ACTIVE SESSIONS" value={currentActive} bgColor="#ecfdf5" iconColor="#10b981" />
        <KpiCard icon={AlertCircle} label="TRACKER FAILURES" value={currentFailures} bgColor="#fffbeb" iconColor="#d97706" />

        {/* Chart: Daily Active Users */}
        <div style={{ ...cardStyle, gridColumn: "span 8" }}>
          <h3 style={{ fontSize: "16px", color: "#0f172a", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
            <BarChart2 size={18} color="#2563eb" /> Daily Active Users (7D)
          </h3>
          <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer>
              <LineChart data={metrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontFamily: "'Fira Code', monospace" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b", fontFamily: "'Fira Code', monospace" }} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: "3 3" }} />
                <Line 
                  type="monotone" 
                  dataKey="ActiveUsers" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "#ffffff", stroke: "#2563eb", strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: "#2563eb", stroke: "#bfdbfe", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart: Difficult Modules */}
        <div style={{ ...cardStyle, gridColumn: "span 4" }}>
          <h3 style={{ fontSize: "16px", color: "#0f172a", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
            <AlertCircle size={18} color="#d97706" /> Difficult Modules
          </h3>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>Highest tracking failure rates (30D)</p>
          <div style={{ height: "260px", width: "100%" }}>
            <ResponsiveContainer>
              <BarChart data={engagement || []} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="module_name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="failure_count" name="Failures" radius={[0, 4, 4, 0]} barSize={20}>
                  {
                    (engagement || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#d97706" : "rgba(217, 119, 6, 0.4)"} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
