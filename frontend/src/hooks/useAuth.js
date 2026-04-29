import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export function useAuth() {
  const navigate = useNavigate();
  const store    = useAuthStore();

  const login = async (credentials) => {
    const result = await store.login(credentials);
    if (result.success) {
      if (result.role === "VENDOR") navigate("/vendor/dashboard");
      else if (result.role === "ADMIN")  navigate("/admin/dashboard");
      else navigate("/dashboard");
    }
    return result;
  };

  const register = async (data) => {
    const result = await store.register(data);
    if (result.success) {
      if (result.role === "VENDOR") navigate("/vendor/dashboard");
      else navigate("/dashboard");
    }
    return result;
  };

  const logout = async () => {
    await store.logout();
    navigate("/login");
  };

  return {
    user:            store.user,
    loading:         store.loading,
    error:           store.error,
    clearError:      store.clearError,
    isAuthenticated: store.isAuthenticated(),
    isUser:          store.isUser(),
    isVendor:        store.isVendor(),
    isAdmin:         store.isAdmin(),
    login,
    register,
    logout,
  };
}