const { supabase } = require('../../config/db');

// Helper: resolve UUID to bigint id
const resolveUserId = async (authId) => {
  if (!authId) return null;
  if (!isNaN(authId)) return parseInt(authId); // already bigint

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', authId)
    .maybeSingle();

  return data ? data.id : null;
};

exports.logEvent = async (userId, eventType, metadata = {}) => {
  try {
    const realUserId = await resolveUserId(userId);

    const { error } = await supabase
      .from('analytics_events')
      .insert([{
        user_id: realUserId,
        event_type: eventType,
        metadata: metadata
      }]);

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
    const realUserId = await resolveUserId(userId);

    const payloads = events.map(e => ({
      user_id: realUserId,
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