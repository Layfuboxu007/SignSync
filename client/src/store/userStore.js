import { create } from 'zustand';
import { supabase, API } from '../api';

export const useUserStore = create((set) => ({
  session: null,
  profile: null,
  loading: true,

  initializeSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      set({ session });
      
      if (session) {
        const { data: profile } = await API.get('/user/me');
        set({ profile });
      }
    } catch (error) {
      console.error("Failed to initialize session", error);
    } finally {
      set({ loading: false });
    }
  },

  upgradeMembership: async () => {
    try {
      const { data } = await API.post('/user/membership', { status: 'member' });
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
