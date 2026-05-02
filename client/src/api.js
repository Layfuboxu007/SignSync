import axios from "axios";
import { createClient } from "@supabase/supabase-js";

export const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/v1",
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Request Interceptor ────────────────────────────────────
// Attaches the Supabase JWT to every outgoing API request.
API.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ── Response Interceptor ───────────────────────────────────
// Passively tracks API errors for the admin analytics dashboard.
// This fires silently in the background and never blocks the UI.
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only track if we have a real server error (not network issues)
    // Skip tracking errors on the /admin/track endpoint itself to prevent infinite loops
    if (error.response && error.response.status >= 400 && !error.config?.url?.includes('/admin/track')) {
      const eventPayload = {
        event_type: "api_error",
        metadata: {
          status: error.response.status,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
        }
      };

      // Fire-and-forget — never await, never block, never fail visibly
      API.post("/admin/track", eventPayload).catch(() => {});
    }

    return Promise.reject(error);
  }
);