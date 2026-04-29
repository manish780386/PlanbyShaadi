import { create } from "zustand";
import { startAISession, sendAIMessage } from "../api/chat.js";

const useChatStore = create((set, get) => ({
  // Current session
  sessionKey:  null,
  eventType:   "",
  city:        "",
  budget:      null,
  guestCount:  null,

  // Chat messages shown in UI
  messages:    [],

  // Plans returned by AI
  plans:       null,
  vendors:     [],
  summary:     "",

  // UI state
  loading:     false,
  error:       null,
  step:        1, // 1=event, 2=city, 3=budget+guests, 4=results

  // ── Step setters ────────────────────────────────────────────
  setEventType:  (v) => set({ eventType: v }),
  setCity:       (v) => set({ city: v }),
  setBudget:     (v) => set({ budget: v }),
  setGuestCount: (v) => set({ guestCount: v }),
  setStep:       (v) => set({ step: v }),

  // ── Start new session ────────────────────────────────────────
  startSession: async () => {
    const { eventType, city, budget, guestCount } = get();
    set({ loading: true, error: null });

    try {
      const res  = await startAISession({
        event_type:  eventType,
        city,
        budget:      Number(budget),
        guest_count: Number(guestCount),
      });

      const { session_key, summary, plans, vendors } = res.data;

      // Add user message to chat
      const userMsg = {
        role:    "user",
        content: `Plan a ${eventType} in ${city} for ${guestCount} guests with budget ₹${Number(budget).toLocaleString("en-IN")}`,
        id:      Date.now(),
      };

      // Add assistant message to chat
      const assistantMsg = {
        role:    "assistant",
        content: summary,
        plans,
        vendors,
        id:      Date.now() + 1,
      };

      set({
        sessionKey: session_key,
        summary,
        plans,
        vendors,
        messages:  [userMsg, assistantMsg],
        loading:   false,
        step:      4,
      });

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || "AI service error. Try again.";
      set({ loading: false, error: msg });
      return { success: false, error: msg };
    }
  },

  // ── Send follow-up message ───────────────────────────────────
  sendMessage: async (message) => {
    const { sessionKey, messages } = get();
    if (!sessionKey) return;

    const userMsg = { role: "user", content: message, id: Date.now() };
    set({ messages: [...messages, userMsg], loading: true, error: null });

    try {
      const res   = await sendAIMessage({ session_key: sessionKey, message });
      const reply = res.data.reply;

      const assistantMsg = {
        role:    "assistant",
        content: reply,
        id:      Date.now() + 1,
      };

      set({
        messages: [...get().messages, assistantMsg],
        loading:  false,
      });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to get response.";
      set({ loading: false, error: msg });
    }
  },

  // ── Reset chat ───────────────────────────────────────────────
  reset: () =>
    set({
      sessionKey: null,
      eventType:  "",
      city:       "",
      budget:     null,
      guestCount: null,
      messages:   [],
      plans:      null,
      vendors:    [],
      summary:    "",
      loading:    false,
      error:      null,
      step:       1,
    }),
}));

export default useChatStore;