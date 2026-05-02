import React, { useEffect, useState } from "react";
import { Users, Activity, BarChart2, AlertCircle } from "lucide-react";
import { API } from "../../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell
} from "recharts";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("7"); // '7', '30', '90', 'custom'
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        let urlOverview = `/api/admin/metrics/overview?days=${filterType !== 'custom' ? filterType : 0}`;
        let urlEngagement = `/api/admin/metrics/engagement?days=${filterType !== 'custom' ? filterType : 0}`;
        
        if (filterType === 'custom') {
           urlOverview += `&startDate=${startDate}&endDate=${endDate}`;
           urlEngagement += `&startDate=${startDate}&endDate=${endDate}`;
        }
        
        const [overviewRes, engagementRes] = await Promise.all([
          API.get(urlOverview),
          API.get(urlEngagement)
        ]);

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
  }, [filterType, startDate, endDate]);

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center", color: "#64748b", fontFamily: "'Fira Code', monospace" }}>
      <div style={{ display: "inline-block", padding: "16px", borderRadius: "16px", background: "#ffffff", border: "1px solid #e2e8f0" }}>
        <Activity size={24} color="#2563eb" className="animate-pulse mb-2 mx-auto" />
        Loading Telemetry Engine...
      </div>
    </div>
  );
  if (error) return <div style={{ padding: "40px", textAlign: "center", color: "#ef4444" }}>Error: {error}</div>;

  const currentActive = metrics.chartData.length > 0 ? metrics.chartData[metrics.chartData.length - 1].ActiveUsers : 0;
  const currentFailures = metrics.chartData.length > 0 ? metrics.chartData[metrics.chartData.length - 1].Failures : 0;

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

  const getDynamicInsights = () => {
    if (!metrics || !metrics.chartData || metrics.chartData.length === 0) {
      return "Insufficient data to generate insights.";
    }
    
    const chart = metrics.chartData;
    const first = chart[0];
    const last = chart[chart.length - 1];
    
    let userTrend = "remained stable";
    if (last.ActiveUsers > first.ActiveUsers) userTrend = `grown by ${last.ActiveUsers - first.ActiveUsers}`;
    if (last.ActiveUsers < first.ActiveUsers) userTrend = `decreased by ${first.ActiveUsers - last.ActiveUsers}`;

    const hardestModule = engagement && engagement.length > 0 ? engagement[0].module_name : "None";

    const daysLabel = filterType === 'custom' ? `the selected period` : `the last ${filterType} days`;
    return `Over ${daysLabel}, active user sessions have ${userTrend}. The most challenging module currently is "${hardestModule}". Consider adding supplementary video tutorials or slowing down the tracking requirement for this module to reduce failure rates.`;
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

  return (
    <div className="animate-fade-in" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", color: "#0f172a", marginBottom: "4px", fontWeight: "700" }}>System Analytics</h1>
          <p style={{ color: "#64748b", fontSize: "14px" }}>Real-time overview of platform usage and AI tracker performance.</p>
        </div>
        
        <div>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ 
              padding: "8px 16px", 
              borderRadius: "8px", 
              border: "1px solid #e2e8f0", 
              background: "#fff", 
              color: "#0f172a",
              fontWeight: "500",
              cursor: "pointer",
              outline: "none"
            }}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="custom">Custom Date Range</option>
          </select>

          {filterType === 'custom' && (
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
              />
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid layout */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(12, 1fr)", 
        gap: "24px", 
        marginBottom: "24px" 
      }}>
        
        {/* KPI: Total Users */}
        <div 
          style={{ ...cardStyle, gridColumn: "span 4" }}
          onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              background: "#eff6ff", 
              color: "#2563eb", 
              padding: "16px", 
              borderRadius: "12px",
            }}>
              <Users size={28} />
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em", marginBottom: "4px" }}>TOTAL USERS</p>
              <h2 style={{ fontSize: "32px", color: "#0f172a", fontFamily: "'Fira Code', monospace", fontWeight: "700", lineHeight: 1 }}>{metrics.totalUsers}</h2>
            </div>
          </div>
        </div>
        
        {/* KPI: Active Sessions */}
        <div 
          style={{ ...cardStyle, gridColumn: "span 4" }}
          onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              background: "#ecfdf5", 
              color: "#10b981", 
              padding: "16px", 
              borderRadius: "12px",
            }}>
              <Activity size={28} />
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em", marginBottom: "4px" }}>ACTIVE SESSIONS</p>
              <h2 style={{ fontSize: "32px", color: "#0f172a", fontFamily: "'Fira Code', monospace", fontWeight: "700", lineHeight: 1 }}>{currentActive}</h2>
            </div>
          </div>
        </div>

        {/* KPI: Tracker Failures */}
        <div 
          style={{ ...cardStyle, gridColumn: "span 4" }}
          onMouseOver={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)"; }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              background: "#fffbeb", 
              color: "#d97706", 
              padding: "16px", 
              borderRadius: "12px",
            }}>
              <AlertCircle size={28} />
            </div>
            <div>
              <p style={{ color: "#64748b", fontSize: "12px", fontWeight: "600", letterSpacing: "0.05em", marginBottom: "4px" }}>TRACKER FAILURES</p>
              <h2 style={{ fontSize: "32px", color: "#0f172a", fontFamily: "'Fira Code', monospace", fontWeight: "700", lineHeight: 1 }}>{currentFailures}</h2>
            </div>
          </div>
        </div>

        {/* Dynamic AI Insights */}
        <div style={{ ...cardStyle, gridColumn: "span 12", background: "var(--color-brand-light)", borderColor: "var(--color-brand-dark)" }}>
          <h3 style={{ fontSize: "16px", color: "var(--color-brand-dark)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
            🤖 AI Performance Insight
          </h3>
          <p style={{ color: "var(--color-brand-dark)", lineHeight: 1.6 }}>{getDynamicInsights()}</p>
        </div>

        {/* Chart: Daily Active Users */}
        <div style={{ ...cardStyle, gridColumn: "span 8" }}>
          <h3 style={{ fontSize: "16px", color: "#0f172a", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", fontWeight: "600" }}>
            <BarChart2 size={18} color="#2563eb" /> Daily Active Users {filterType === 'custom' ? '(Custom Range)' : `(${filterType}D)`}
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
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "24px" }}>Highest tracking failure rates {filterType === 'custom' ? '(Custom Range)' : `(${filterType}D)`}</p>
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
