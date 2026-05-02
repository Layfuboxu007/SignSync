import { useCallback, useEffect, useRef } from 'react';
import { API } from '../api';

const batchQueue = [];
let isFlushing = false;

export function useAnalytics() {
  const trackEvent = useCallback((eventType, metadata = {}) => {
    batchQueue.push({ event_type: eventType, metadata, timestamp: new Date().toISOString() });
  }, []);

  useEffect(() => {
    const flushQueue = async () => {
      if (batchQueue.length === 0 || isFlushing) return;
      isFlushing = true;
      const eventsToFlush = [...batchQueue];
      batchQueue.length = 0; // clear queue

      try {
        await API.post('/admin/track/batch', { events: eventsToFlush });
      } catch (err) {
        console.warn("Analytics batch tracking failed:", err);
        // Put them back if failed so we don't lose data
        batchQueue.unshift(...eventsToFlush);
      } finally {
        isFlushing = false;
      }
    };

    const interval = setInterval(flushQueue, 30000); // 30 seconds

    return () => {
      clearInterval(interval);
      if (batchQueue.length > 0) {
        // flush remaining on unmount (best effort, using fetch to avoid hanging)
        API.post('/admin/track/batch', { events: batchQueue }).catch(() => {});
        batchQueue.length = 0;
      }
    };
  }, []);

  return { trackEvent };
}
