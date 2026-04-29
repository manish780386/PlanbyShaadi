import api from "./axios";

// ── AI Chatbot ────────────────────────────────────────────────

// Start new AI planning session
// data: { event_type, city, budget, guest_count }
export const startAISession = (data) =>
  api.post("/chat/ai/start/", data);

// Send follow-up message in existing session
// data: { session_key, message }
export const sendAIMessage = (data) =>
  api.post("/chat/ai/message/", data);

// Get all past AI sessions for logged-in user
export const getAISessions = () =>
  api.get("/chat/ai/history/");

// Get full message history of one session
export const getAISessionDetail = (sessionKey) =>
  api.get(`/chat/ai/session/${sessionKey}/`);

// ── Vendor-User Real Chat ─────────────────────────────────────

// Get all chat rooms for current user or vendor
export const getChatRooms = () =>
  api.get("/chat/rooms/");

// Get all messages in a room
export const getChatMessages = (roomId) =>
  api.get(`/chat/rooms/${roomId}/messages/`);

// Send a message in a room
export const sendChatMessage = (roomId, message) =>
  api.post(`/chat/rooms/${roomId}/send/`, { message });

// ── Events List (for chatbot step 1) ─────────────────────────
export const getEvents = () =>
  api.get("/events/");