import { useState, useEffect } from "react";
import { API } from "../api";

export function useAdmin() {
  const [metrics, setMetrics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [overviewRes, engagementRes] = await Promise.all([
          API.get("/admin/metrics/overview"),
          API.get("/admin/metrics/engagement")
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
  }, []);

  const currentActive = metrics?.chartData?.length > 0
    ? metrics.chartData[metrics.chartData.length - 1].ActiveUsers
    : 0;

  const currentFailures = metrics?.chartData?.length > 0
    ? metrics.chartData[metrics.chartData.length - 1].Failures
    : 0;

  return {
    metrics,
    engagement,
    loading,
    error,
    currentActive,
    currentFailures
  };
}
