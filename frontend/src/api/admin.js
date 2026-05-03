import api from "./axios";

// ── Dashboard Analytics ───────────────────────────────────────
export const getAdminDashboard = () =>
  api.get("/admin/dashboard/");

// ── Users ─────────────────────────────────────────────────────
export const getAdminUsers = (params = {}) =>
  api.get("/admin/users/", { params });

export const getAdminUserDetail = (id) =>
  api.get(`/admin/users/${id}/`);

export const deleteAdminUser = (id) =>
  api.delete(`/admin/users/${id}/`);

// ── Vendors ───────────────────────────────────────────────────
export const getAdminVendors = (params = {}) =>
  api.get("/admin/vendors/", { params });

export const verifyVendor = (id) =>
  api.post(`/admin/vendors/${id}/verify/`);

export const deactivateVendor = (id) =>
  api.post(`/admin/vendors/${id}/deactivate/`);

export const deleteVendor = (id) =>
  api.delete(`/admin/vendors/${id}/delete/`);

// ── Bookings ──────────────────────────────────────────────────
export const getAdminBookings = (params = {}) =>
  api.get("/admin/bookings/", { params });

// ── AI Sessions ───────────────────────────────────────────────
export const getAdminAISessions = (params = {}) =>
  api.get("/admin/ai-sessions/", { params });

export const getAdminAISessionDetail = (sessionKey) =>
  api.get(`/admin/ai-sessions/${sessionKey}/`);