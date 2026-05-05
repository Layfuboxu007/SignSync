import { create } from 'zustand';
import { supabase, API } from '../api';

export const useUserStore = create((set, get) => ({
  session: null,
  profile: null,
  loading: true,

  /**
   * Initialize session from Supabase and fetch the user profile.
   * Also sets up a listener for auth state changes (login, logout, token refresh)
   * so the store stays in sync without manual re-initialization.
   */
  initializeSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session });
      
      if (session) {
        const { data: profile } = await API.get('/users/me');
        set({ profile });
      }
    } catch (error) {
      console.error("Failed to initialize session", error);
    } finally {
      set({ loading: false });
    }

    // Reactive listener — keeps store in sync when user logs in/out
    // in another tab or when the token refreshes automatically.
    supabase.auth.onAuthStateChange(async (event, session) => {
      const prev = get().session;

      // Avoid redundant fetches if the session hasn't actually changed
      if (prev?.access_token === session?.access_token) return;

      set({ session });

      if (session) {
        try {
          const { data: profile } = await API.get('/users/me');
          set({ profile });
        } catch {
          // Token may have expired between state change and API call
          set({ profile: null });
        }
      } else {
        set({ profile: null });
      }
    });
  },

  /**
   * Lightweight profile refresh — re-fetches /users/me without
   * touching the Supabase session. Use this after mutations
   * (e.g. membership upgrade) instead of full re-init.
   */
  refreshProfile: async () => {
    try {
      const { data: profile } = await API.get('/users/me');
      set({ profile });
      return profile;
    } catch (error) {
      console.error("Failed to refresh profile", error);
      return null;
    }
  },

  upgradeMembership: async () => {
    try {
      const { data } = await API.post('/users/membership', { status: 'member' });
      if (data.success) {
        set({ profile: data.user });
        return true;
      }
    } catch (error) {
      console.error("Failed to upgrade membership", error);
      return false;
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  }
}));
