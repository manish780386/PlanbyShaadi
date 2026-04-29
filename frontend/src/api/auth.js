import api from "./axios";

// ── Register ──────────────────────────────────────────────────
export const registerUser = (data) =>
  api.post("/auth/register/", data);

// ── Login (email+password OR phone+password) ──────────────────
export const loginUser = (data) =>
  api.post("/auth/login/", data);

// ── Logout ────────────────────────────────────────────────────
export const logoutUser = (refresh) =>
  api.post("/auth/logout/", { refresh });

// ── Get Profile ───────────────────────────────────────────────
export const getProfile = () =>
  api.get("/auth/profile/");

// ── Update Profile ────────────────────────────────────────────
export const updateProfile = (data) =>
  api.patch("/auth/profile/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ── Change Password ───────────────────────────────────────────
export const changePassword = (data) =>
  api.put("/auth/change-password/", data);

// ── Refresh Token ─────────────────────────────────────────────
export const refreshToken = (refresh) =>
  api.post("/auth/token/refresh/", { refresh });