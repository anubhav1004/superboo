import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Message,
  Session,
  Task,
  TaskStatus,
  TaskStep,
} from "../types";
import { SEED_TASKS } from "../data/tasks";
import { SKILLS } from "../data/skills";

export type ConnectionStatus = "online" | "offline" | "checking";

interface ChatState {
  sessions: Session[];
  activeSessionId: string | null;
  sidebarOpen: boolean;
  skillsOpen: boolean;
  connectorsOpen: boolean;
  settingsOpen: boolean;
  tasks: Task[];
  activeTaskId: string | null;
  agentId: string;
  model: string;
  connection: ConnectionStatus;
  latency: number | null;

  createSession: (title?: string) => string;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;
  setActiveSession: (id: string) => void;
  addMessage: (sessionId: string, msg: Message) => void;
  updateMessage: (
    sessionId: string,
    msgId: string,
    patch: Partial<Message>
  ) => void;
  toggleSidebar: () => void;
  setSkillsOpen: (open: boolean) => void;
  setConnectorsOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setAgent: (id: string, model: string) => void;
  setConnection: (status: ConnectionStatus, latency?: number) => void;

  openTask: (id: string) => void;
  closeTask: () => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  createTaskFromSkill: (
    skillId: string,
    title: string,
    sessionId?: string
  ) => string;
  updateTaskStep: (
    taskId: string,
    stepId: string,
    patch: Partial<TaskStep>
  ) => void;
  advanceTaskProgress: (taskId: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function makeStepsForSkill(skillId: string): TaskStep[] {
  const base = [
    "Parse request & load skill",
    "Prepare inputs",
    "Execute main action",
    "Post-process outputs",
    "Finalize & notify",
  ];
  const skill = SKILLS.find((s) => s.id === skillId);
  return base.map((title, i) => ({
    id: uid(),
    title,
    status: i === 0 ? "running" : "pending",
    tool: skill?.model || skill?.id,
    startedAt: i === 0 ? Date.now() : 0,
  }));
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      sidebarOpen: typeof window !== "undefined" ? window.innerWidth >= 768 : true,
      skillsOpen: false,
      connectorsOpen: false,
      settingsOpen: false,
      tasks: SEED_TASKS,
      activeTaskId: null,
      agentId: "heisenberg",
      model: "zai/glm-5",
      connection: "checking",
      latency: null,

      createSession: (title = "New chat") => {
        const id = uid();
        const now = Date.now();
        const session: Session = {
          id,
          title,
          agentId: get().agentId,
          model: get().model,
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          sessions: [session, ...s.sessions],
          activeSessionId: id,
        }));
        return id;
      },

      deleteSession: (id) =>
        set((s) => {
          const sessions = s.sessions.filter((x) => x.id !== id);
          const activeSessionId =
            s.activeSessionId === id
              ? sessions[0]?.id ?? null
              : s.activeSessionId;
          return { sessions, activeSessionId };
        }),

      renameSession: (id, title) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === id ? { ...x, title, updatedAt: Date.now() } : x
          ),
        })),

      setActiveSession: (id) => set({ activeSessionId: id }),

      addMessage: (sessionId, msg) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === sessionId
              ? {
                  ...x,
                  messages: [...x.messages, msg],
                  updatedAt: Date.now(),
                }
              : x
          ),
        })),

      updateMessage: (sessionId, msgId, patch) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === sessionId
              ? {
                  ...x,
                  messages: x.messages.map((m) =>
                    m.id === msgId ? { ...m, ...patch } : m
                  ),
                }
              : x
          ),
        })),

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSkillsOpen: (open) => set({ skillsOpen: open }),
      setConnectorsOpen: (open) => set({ connectorsOpen: open }),
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      setAgent: (agentId, model) => set({ agentId, model }),
      setConnection: (status, latency) =>
        set({
          connection: status,
          latency: latency ?? get().latency,
        }),

      openTask: (id) => set({ activeTaskId: id }),
      closeTask: () => set({ activeTaskId: null }),
      setTaskStatus: (id, status) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  progress: status === "completed" ? 100 : t.progress,
                  approvedAt:
                    status === "completed" ? Date.now() : t.approvedAt,
                  cancelledAt:
                    status === "cancelled" ? Date.now() : t.cancelledAt,
                  updatedAt: Date.now(),
                }
              : t
          ),
        })),

      createTaskFromSkill: (skillId, title, sessionId) => {
        const id = `task_${uid()}`;
        const steps = makeStepsForSkill(skillId);
        const task: Task = {
          id,
          title,
          skill: skillId,
          sessionId,
          status: "running",
          progress: 5,
          steps,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return id;
      },

      updateTaskStep: (taskId, stepId, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: Date.now(),
                  steps: t.steps.map((st) =>
                    st.id === stepId ? { ...st, ...patch } : st
                  ),
                }
              : t
          ),
        })),

      advanceTaskProgress: (taskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== taskId || t.status !== "running") return t;
            const currentIdx = t.steps.findIndex(
              (st) => st.status === "running"
            );
            if (currentIdx === -1) return t;
            const now = Date.now();
            const newSteps = [...t.steps];
            newSteps[currentIdx] = {
              ...newSteps[currentIdx],
              status: "done",
              completedAt: now,
            };
            if (currentIdx + 1 < newSteps.length) {
              newSteps[currentIdx + 1] = {
                ...newSteps[currentIdx + 1],
                status: "running",
                startedAt: now,
              };
            }
            const done = newSteps.filter((st) => st.status === "done").length;
            return {
              ...t,
              steps: newSteps,
              progress: Math.round((done / newSteps.length) * 100),
              updatedAt: now,
            };
          }),
        })),
    }),
    {
      name: "superboo-ui-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        sessions: s.sessions,
        activeSessionId: s.activeSessionId,
        tasks: s.tasks,
        sidebarOpen: s.sidebarOpen,
        agentId: s.agentId,
        model: s.model,
      }),
    }
  )
);

export { uid };
