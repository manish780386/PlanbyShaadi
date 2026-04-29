import api from "./axios";

// ── User ──────────────────────────────────────────────────────

// Create booking request
export const createBooking = (data) =>
  api.post("/bookings/", data);

// Get my bookings (user)
export const getMyBookings = () =>
  api.get("/bookings/my/");

// Get booking detail
export const getBookingDetail = (id) =>
  api.get(`/bookings/${id}/`);

// Create Razorpay payment order
export const createPaymentOrder = (id) =>
  api.post(`/bookings/${id}/pay/`);

// Verify payment after Razorpay checkout
export const verifyPayment = (id, data) =>
  api.post(`/bookings/${id}/verify-payment/`, data);

// Submit review after completion
export const submitReview = (id, data) =>
  api.post(`/bookings/${id}/review/`, data);

// ── Vendor ────────────────────────────────────────────────────

// Get all leads (incoming booking requests)
export const getVendorLeads = () =>
  api.get("/bookings/vendor/leads/");

// Accept a booking
export const acceptBooking = (id) =>
  api.post(`/bookings/${id}/accept/`);

// Decline a booking
export const declineBooking = (id) =>
  api.post(`/bookings/${id}/decline/`);

// Mark booking as completed
export const completeBooking = (id) =>
  api.post(`/bookings/${id}/complete/`);