import { useState, useEffect } from "react";
import { API } from "../api";

export function useAdmin(filterType = "7", startDate, endDate) {
  const [metrics, setMetrics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        let urlOverview = `/admin/metrics/overview?days=${filterType !== 'custom' ? filterType : 0}`;
        let urlEngagement = `/admin/metrics/engagement?days=${filterType !== 'custom' ? filterType : 0}`;
        
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
