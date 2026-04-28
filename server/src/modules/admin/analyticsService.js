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
