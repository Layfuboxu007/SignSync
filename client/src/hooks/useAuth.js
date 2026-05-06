import { useState } from "react";
import { supabase, API } from "../api";
import { useUserStore } from "../store/userStore";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Login via server-side resolution.
   * The backend resolves username → email internally and performs
   * the Supabase Auth sign-in. The client never sees the email
   * for username-based logins, closing the enumeration vector.
   */
  const login = async (identifier, password) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/users/login", { identifier, password });

      if (!data.session) {
        throw new Error("Login failed — no session returned");
      }

      // Set the Supabase session so the client-side auth state stays in sync
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

      const role = data.profile?.role || data.role || "student";

      // Update global state
      useUserStore.setState({
        session: data.session,
        profile: data.profile,
        loading: false
      });
      
      return { success: true, role };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Login failed. Please check your credentials.";
      setError(msg);
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
