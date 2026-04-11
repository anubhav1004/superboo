import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Bot } from "../data/bots";

export interface BotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface BotState {
  customBots: Bot[];
  activeBotId: string | null;
  chatHistories: Record<string, BotMessage[]>;

  addCustomBot: (bot: Bot) => void;
  removeCustomBot: (id: string) => void;
  setActiveBotId: (id: string | null) => void;
  addMessage: (botId: string, msg: BotMessage) => void;
  clearHistory: (botId: string) => void;
}

export const useBotStore = create<BotState>()(
  persist(
    (set) => ({
      customBots: [],
      activeBotId: null,
      chatHistories: {},

      addCustomBot: (bot) =>
        set((s) => ({ customBots: [...s.customBots, bot] })),

      removeCustomBot: (id) =>
        set((s) => ({
          customBots: s.customBots.filter((b) => b.id !== id),
          chatHistories: (() => {
            const h = { ...s.chatHistories };
            delete h[id];
            return h;
          })(),
        })),

      setActiveBotId: (id) => set({ activeBotId: id }),

      addMessage: (botId, msg) =>
        set((s) => ({
          chatHistories: {
            ...s.chatHistories,
            [botId]: [...(s.chatHistories[botId] || []), msg],
          },
        })),

      clearHistory: (botId) =>
        set((s) => ({
          chatHistories: { ...s.chatHistories, [botId]: [] },
        })),
    }),
    {
      name: "superboo-bots",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
