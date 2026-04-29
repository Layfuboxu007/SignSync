const { supabase } = require('../../config/db');
const analyticsService = require('./analyticsService');
const catchAsync = require('../../utils/catchAsync');

exports.trackEvent = catchAsync(async (req, res) => {
  const { event_type, metadata } = req.body;
  if (!event_type) return res.status(400).json({ error: 'event_type is required' });

  await analyticsService.logEvent(req.user.id, event_type, metadata);
  res.json({ success: true });
});

exports.getOverviewMetrics = catchAsync(async (req, res) => {
  const { data: metrics, error } = await supabase
    .from('daily_engagement_metrics')
    .select('*')
    .limit(7); // Get last 7 days

  if (error) throw error;

  // Get Total Users
  const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });

  res.json({
    success: true,
    totalUsers,
    recentMetrics: metrics
  });
});

exports.getEngagementMetrics = catchAsync(async (req, res) => {
  // We use the RPC we created in the SQL script
  const { data: difficultModules, error } = await supabase.rpc('get_most_difficult_modules', { days_back: 30 });

  if (error) throw error;

  res.json({
    success: true,
    difficultModules
  });
});

exports.getUsers = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  const { data: users, count, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, role, membership_status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  res.json({
    success: true,
    users,
    total: count
  });
});

exports.getActivityLogs = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const { data: logs, count, error } = await supabase
    .from('analytics_events')
    .select('*, users(first_name, last_name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  res.json({
    success: true,
    logs,
    total: count
  });
});
