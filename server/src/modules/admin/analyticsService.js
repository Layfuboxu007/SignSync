const { supabase } = require('../../config/db');

exports.logEvent = async (userId, eventType, metadata = {}) => {
  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert([
        {
          user_id: userId || null, // null for anonymous events
          event_type: eventType,
          metadata: metadata
        }
      ]);

    if (error) {
      console.error("[AnalyticsService] Error logging event:", error.message);
    }
  } catch (err) {
    console.error("[AnalyticsService] Exception logging event:", err);
  }
};

exports.logBatchEvents = async (userId, events = []) => {
  if (!events.length) return;
  try {
    const payloads = events.map(e => ({
      user_id: userId || null,
      event_type: e.event_type,
      metadata: e.metadata,
      created_at: e.timestamp || new Date().toISOString()
    }));

    const { error } = await supabase
      .from('analytics_events')
      .insert(payloads);

    if (error) {
      console.error("[AnalyticsService] Error logging batch events:", error.message);
    }
  } catch (err) {
    console.error("[AnalyticsService] Exception logging batch events:", err);
  }
};
