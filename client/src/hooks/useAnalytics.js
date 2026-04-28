import { useCallback } from 'react';
import { API } from '../api';

export function useAnalytics() {
  const trackEvent = useCallback(async (eventType, metadata = {}) => {
    try {
      await API.post('/api/admin/track', { event_type: eventType, metadata });
    } catch (err) {
      console.warn("Analytics tracking failed:", err);
    }
  }, []);

  return { trackEvent };
}
