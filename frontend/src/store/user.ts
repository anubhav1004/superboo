import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  interests: string[];
  role: string;
  createdAt: number;
  sessionId: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string; // btoa encoded
  interests: string[];
  role: string;
  createdAt: number;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;

  signup: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setInterests: (interests: string[]) => void;
  setRole: (role: string) => void;
  completeOnboarding: () => void;
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem("superboo-users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem("superboo-users", JSON.stringify(users));
}

function generateId(): string {
  return `u_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,

      signup: async (name: string, email: string, password: string) => {
        const users = getStoredUsers();
        const existing = users.find((u) => u.email === email);
        if (existing) {
          throw new Error("An account with this email already exists.");
        }

        const id = generateId();
        const now = Date.now();
        const encoded = btoa(password);

        const storedUser: StoredUser = {
          id,
          name,
          email,
          password: encoded,
          interests: [],
          role: "",
          createdAt: now,
        };
        users.push(storedUser);
        saveStoredUsers(users);

        const user: User = {
          id,
          name,
          email,
          interests: [],
          role: "",
          createdAt: now,
          sessionId: generateSessionId(),
        };

        set({ user, isAuthenticated: true, isOnboarded: false });
      },

      login: async (email: string, password: string) => {
        const users = getStoredUsers();
        const found = users.find((u) => u.email === email);
        if (!found) {
          throw new Error("No account found with this email.");
        }
        if (found.password !== btoa(password)) {
          throw new Error("Incorrect password.");
        }

        const user: User = {
          id: found.id,
          name: found.name,
          email: found.email,
          interests: found.interests,
          role: found.role,
          createdAt: found.createdAt,
          sessionId: generateSessionId(),
        };

        const onboarded = found.interests.length > 0 && found.role !== "";
        set({ user, isAuthenticated: true, isOnboarded: onboarded });
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, isOnboarded: false });
      },

      setInterests: (interests: string[]) => {
        set((state) => {
          if (!state.user) return state;
          const updated = { ...state.user, interests };
          // Sync to stored users
          const users = getStoredUsers();
          const idx = users.findIndex((u) => u.id === updated.id);
          if (idx >= 0) {
            users[idx] = { ...users[idx], interests };
            saveStoredUsers(users);
          }
          return { user: updated };
        });
      },

      setRole: (role: string) => {
        set((state) => {
          if (!state.user) return state;
          const updated = { ...state.user, role };
          // Sync to stored users
          const users = getStoredUsers();
          const idx = users.findIndex((u) => u.id === updated.id);
          if (idx >= 0) {
            users[idx] = { ...users[idx], role };
            saveStoredUsers(users);
          }
          return { user: updated };
        });
      },

      completeOnboarding: () => {
        set({ isOnboarded: true });
      },
    }),
    {
      name: "superboo-user",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        isOnboarded: s.isOnboarded,
      }),
    }
  )
);
