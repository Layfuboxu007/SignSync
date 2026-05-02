import { useState } from "react";
import { supabase, API } from "../api";
import { useUserStore } from "../store/userStore";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setProfile, setSession } = useUserStore.getState();

  const login = async (username, password) => {
    setLoading(true);
    setError("");
    try {
      let loginEmail = username;
      if (!loginEmail.includes('@')) {
        try {
          const res = await API.post("/users/lookup-email", { username });
          loginEmail = res.data.email;
        } catch (e) {
          throw new Error(e.response?.data?.error || "Username not found in system");
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password
      });
      if (error) throw error;
      
      const { data: dbData } = await API.get("/users/me");
      const role = dbData?.data?.role || dbData?.role || "student";
      
      // CRITICAL: Update the global state so ProtectedRoute knows we are logged in!
      useUserStore.setState({ session: data.session, profile: dbData?.data || dbData, loading: false });
      
      return { success: true, role };
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });
      if (error) throw error;
      
      await API.post("/users/sync", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        email: userData.email,
        role: userData.role || "student"
      });

      const { data: dbData } = await API.get("/users/me");
      useUserStore.setState({ session: data.session, profile: dbData?.data || dbData, loading: false });

      return { success: true, role: userData.role || "student" };
    } catch (err) {
      setError(err.message || "Registration failed.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loading, error, setError };
}
