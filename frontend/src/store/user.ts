import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getConfig } from "../lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  interests: string[];
  role: string;
  plan: string;
  createdAt: string;
  sessionId: string;
}

export interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;

  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setInterests: (interests: string[]) => void;
  setRole: (role: string) => void;
  completeOnboarding: () => void;
}

async function authFetch(path: string, body: object) {
  const cfg = getConfig();
  const res = await fetch(`${cfg.url}/v1/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Auth request failed: ${res.status}`);
  return res.json();
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isOnboarded: false,

      signup: async (name: string, email: string, password: string) => {
        const res = await authFetch("/signup", { name, email, password });
        if (!res.ok) throw new Error(res.error || "Signup failed");

        const user: User = {
          ...res.user,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        };
        set({ user, token: res.token, isAuthenticated: true, isOnboarded: false });
      },

      login: async (email: string, password: string) => {
        const res = await authFetch("/login", { email, password });
        if (!res.ok) throw new Error(res.error || "Login failed");

        const user: User = {
          ...res.user,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        };
        set({
          user,
          token: res.token,
          isAuthenticated: true,
          isOnboarded: res.user.onboarded,
        });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isOnboarded: false });
      },

      setInterests: (interests: string[]) => {
        const state = get();
        if (!state.user) return;
        const updated = { ...state.user, interests };
        set({ user: updated });
        // Sync to DB
        authFetch(`/update/${state.user.id}`, { interests }).catch(() => {});
      },

      setRole: (role: string) => {
        const state = get();
        if (!state.user) return;
        const updated = { ...state.user, role };
        set({ user: updated });
        authFetch(`/update/${state.user.id}`, { role }).catch(() => {});
      },

      completeOnboarding: () => {
        const state = get();
        set({ isOnboarded: true });
        if (state.user) {
          authFetch(`/update/${state.user.id}`, { onboarded: true }).catch(() => {});
        }
      },
    }),
    {
      name: "superboo-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
        isOnboarded: s.isOnboarded,
      }),
    }
  )
);
