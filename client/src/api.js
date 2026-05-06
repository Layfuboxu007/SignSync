import axios from "axios";
import { createClient } from "@supabase/supabase-js";

export const API = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/v1",
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── JWT Cache ──────────────────────────────────────────────
// Avoids calling getSession() on every single API request.
// Cache is invalidated when the token expires or when auth state changes.
let cachedToken = null;
let cachedTokenExpiry = 0; // Unix timestamp in seconds

supabase.auth.onAuthStateChange(() => {
  // Invalidate cache on any auth change (login, logout, token refresh)
  cachedToken = null;
  cachedTokenExpiry = 0;
});

function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp || 0;
  } catch {
    return 0;
  }
}

// ── Request Interceptor ────────────────────────────────────
API.interceptors.request.use(async (config) => {
  const now = Math.floor(Date.now() / 1000);

  // Use cached token if it's still valid (with 30s buffer before expiry)
  if (cachedToken && cachedTokenExpiry > now + 30) {
    config.headers.Authorization = `Bearer ${cachedToken}`;
    return config;
  }

  // Token expired or missing — fetch fresh
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    cachedToken = session.access_token;
    cachedTokenExpiry = getTokenExpiry(session.access_token);
    config.headers.Authorization = `Bearer ${cachedToken}`;
  } else {
    cachedToken = null;
    cachedTokenExpiry = 0;
  }
  return config;
});

// ── Response Interceptor ───────────────────────────────────
// Passively tracks API errors for the admin analytics dashboard.
// Rate-limited: max 10 api_error events per minute per page load.
let errorTrackCount = 0;
let errorTrackResetTime = Date.now() + 60000;
const ERROR_TRACK_LIMIT = 10;
const sessionId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    
    // Skip: no response (network error), 401s (expected on logout), or the track endpoint itself
    if (
      !status || 
      status === 401 || 
      error.config?.url?.includes('/admin/track')
    ) {
      return Promise.reject(error);
    }

    // Rate limit error tracking
    const now = Date.now();
    if (now > errorTrackResetTime) {
      errorTrackCount = 0;
      errorTrackResetTime = now + 60000;
    }

    if (status >= 400 && errorTrackCount < ERROR_TRACK_LIMIT) {
      errorTrackCount++;
      API.post("/admin/track", {
        event_type: "api_error",
        metadata: {
          status,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          sessionId,
        }
      }).catch(() => {});
    }

    return Promise.reject(error);
  }
);