const { supabase } = require('../../config/db');
const analyticsService = require('./analyticsService');

exports.trackEvent = async (req, res) => {
  try {
    const { event_type, metadata } = req.body;
    if (!event_type) return res.status(400).json({ error: 'event_type is required' });

    await analyticsService.logEvent(req.user.id, event_type, metadata);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.trackBatchEvents = async (req, res) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'events array is required' });
    }

    await analyticsService.logBatchEvents(req.user.id, events);
    res.json({ success: true, count: events.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOverviewMetrics = async (req, res) => {
  try {
    let query = supabase.from('daily_engagement_metrics').select('*').order('report_date', { ascending: false });

    if (req.query.startDate && req.query.endDate) {
      query = query.gte('report_date', req.query.startDate).lte('report_date', req.query.endDate);
    } else {
      const days = parseInt(req.query.days) || 7;
      if (days > 0) {
        query = query.limit(days);
      }
    }

    const { data: metrics, error } = await query;

    if (error) throw error;

    // Get Total Users
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });

    res.json({
      success: true,
      totalUsers,
      recentMetrics: metrics
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEngagementMetrics = async (req, res) => {
  try {
    let days = parseInt(req.query.days) || 30;
    
    // If a custom range is passed, calculate the number of days back from today
    // Since the RPC `get_most_difficult_modules` only accepts days_back integer
    if (req.query.startDate && req.query.endDate) {
      const start = new Date(req.query.startDate);
      const end = new Date(req.query.endDate);
      const today = new Date();
      // Use the difference between today and the start date to grab the full range
      days = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    }

    // We use the RPC we created in the SQL script
    const { data: difficultModules, error } = await supabase.rpc('get_most_difficult_modules', { days_back: days });

    if (error) throw error;

    res.json({
      success: true,
      difficultModules
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const { data: transactions, count, error } = await supabase
      .from('transactions')
      .select('*, users(first_name, last_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
       if (error.code === '42P01') { // relation does not exist
         return res.json({ success: true, transactions: [], total: 0 });
       }
       throw error;
    }

    res.json({
      success: true,
      transactions,
      total: count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
