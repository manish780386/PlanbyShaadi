import { create } from "zustand";
import { loginUser, registerUser, logoutUser } from "../api/auth.js";
import { clearAuth } from "../api/axios.js";

const getStoredUser = () => {
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  user:         getStoredUser(),
  accessToken:  localStorage.getItem("access_token") || null,
  refreshToken: localStorage.getItem("refresh_token") || null,
  loading:      false,
  error:        null,

  // ── Login ───────────────────────────────────────────────────
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res  = await loginUser(credentials);
      const { user, tokens } = res.data;

      localStorage.setItem("access_token",  tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user",          JSON.stringify(user));

      set({
        user,
        accessToken:  tokens.access,
        refreshToken: tokens.refresh,
        loading:      false,
        error:        null,
      });

      return { success: true, role: user.role };
    } catch (err) {
      const msg = err.response?.data?.detail ||
                  err.response?.data?.non_field_errors?.[0] ||
                  "Login failed. Please try again.";
      set({ loading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  // ── Register ────────────────────────────────────────────────
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res  = await registerUser(data);
      const { user, tokens } = res.data;

      localStorage.setItem("access_token",  tokens.access);
      localStorage.setItem("refresh_token", tokens.refresh);
      localStorage.setItem("user",          JSON.stringify(user));

      set({
        user,
        accessToken:  tokens.access,
        refreshToken: tokens.refresh,
        loading:      false,
        error:        null,
      });

      return { success: true, role: user.role };
    } catch (err) {
      const data = err.response?.data || {};
      const msg  = data.email?.[0] ||
                   data.phone?.[0] ||
                   data.password?.[0] ||
                   data.non_field_errors?.[0] ||
                   "Registration failed.";
      set({ loading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  // ── Logout ──────────────────────────────────────────────────
  logout: async () => {
    try {
      const refresh = get().refreshToken;
      if (refresh) await logoutUser(refresh);
    } catch {}
    clearAuth();
    set({ user: null, accessToken: null, refreshToken: null, error: null });
  },

  // ── Helpers ─────────────────────────────────────────────────
  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  clearError: () => set({ error: null }),

  isAuthenticated: () => !!get().accessToken,
  isUser:          () => get().user?.role === "USER",
  isVendor:        () => get().user?.role === "VENDOR",
  isAdmin:         () => get().user?.role === "ADMIN",
}));

export default useAuthStore;