import api from "./axios";

// ── Public ────────────────────────────────────────────────────

// Get vendors list with filters
// params: { city, category, min_price, max_price, min_rating, search, ordering, page }
export const getVendors = (params = {}) =>
  api.get("/vendors/", { params });

// Get single vendor detail
export const getVendorDetail = (id) =>
  api.get(`/vendors/${id}/`);

// ── Vendor Dashboard ──────────────────────────────────────────

// Register vendor profile (first time)
export const registerVendorProfile = (data) =>
  api.post("/vendors/register/", data);

// Get own vendor profile
export const getMyVendorProfile = () =>
  api.get("/vendors/profile/");

// Update own vendor profile
export const updateVendorProfile = (data) =>
  api.patch("/vendors/profile/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Upload portfolio image
export const uploadVendorImage = (formData) =>
  api.post("/vendors/images/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete portfolio image
export const deleteVendorImage = (id) =>
  api.delete(`/vendors/images/${id}/`);

// Get packages
export const getVendorPackages = () =>
  api.get("/vendors/packages/");

// Add package
export const addVendorPackage = (data) =>
  api.post("/vendors/packages/", data);

// Delete package
export const deleteVendorPackage = (id) =>
  api.delete(`/vendors/packages/${id}/`);

// Get unavailable dates
export const getVendorAvailability = () =>
  api.get("/vendors/availability/");

// Add unavailable date
export const addUnavailableDate = (data) =>
  api.post("/vendors/availability/", data);

// Remove unavailable date
export const removeUnavailableDate = (id) =>
  api.delete(`/vendors/availability/${id}/`);

// Get earnings summary
export const getVendorEarnings = () =>
  api.get("/vendors/earnings/");