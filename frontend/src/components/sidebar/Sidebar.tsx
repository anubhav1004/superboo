import { useState } from "react";
import {
  Plus,
  MessageSquare,
  Sparkles,
  Plug,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  Search,
  Settings as SettingsIcon,
} from "lucide-react";

function GhostIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#ghostGradSidebar)"
      />
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#ghostGradSidebar)" />
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#ghostGradSidebar)" />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25" />
      <defs>
        <radialGradient id="ghostGradSidebar" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}
import clsx from "clsx";
import { useChatStore } from "../../store/chat";
import TasksList from "../tasks/TasksList";

interface Props {
  onOpenSkills: () => void;
  onOpenConnectors: () => void;
  onOpenSettings: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export default function Sidebar({
  onOpenSkills,
  onOpenConnectors,
  onOpenSettings,
}: Props) {
  const {
    sessions,
    activeSessionId,
    sidebarOpen,
    toggleSidebar,
    createSession,
    setActiveSession,
    deleteSession,
    connection,
  } = useChatStore();
  const [query, setQuery] = useState("");

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (!sidebarOpen) {
    return (
      <div className="hidden md:flex w-16 border-r border-border bg-bg flex-col items-center py-5 gap-2">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
          title="Expand sidebar"
        >
          <PanelLeft size={18} />
        </button>
        <div className="h-3" />
        <div className="transition-transform hover:scale-110 active:scale-95">
          <GhostIcon size={28} />
        </div>
        <div className="h-3" />
        <button
          onClick={() => createSession()}
          className="p-2.5 rounded-full bg-gradient-to-br from-accent to-accent-hover text-white shadow-card transition-all hover:scale-110 active:scale-95"
          title="New chat"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={onOpenSkills}
          className="p-2.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
          title="Skills"
        >
          <Sparkles size={16} />
        </button>
        <button
          onClick={onOpenConnectors}
          className="p-2.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
          title="Connectors"
        >
          <Plug size={16} />
        </button>
        <div className="flex-1" />
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
          title="Settings"
        >
          <SettingsIcon size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}
    <aside className={clsx(
      "border-r border-border flex flex-col h-full",
      isMobile
        ? "fixed inset-y-0 left-0 z-50 w-[280px] shadow-2xl"
        : "w-[280px]"
    )} style={{background: 'linear-gradient(to bottom, #0c0c12, #0a0a0e 40%)'}}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="transition-transform group-hover:scale-110 group-hover:-translate-y-0.5">
            <GhostIcon size={28} />
          </div>
          <span className="text-[16px] font-semibold bg-gradient-to-r from-[#c084fc] to-[#a78bfa] bg-clip-text text-transparent">
            Superboo
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-bg-surface text-fg-dim hover:text-fg transition-all hover:scale-105 active:scale-95"
          title="Collapse"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      {/* New chat */}
      <div className="px-4 pb-4">
        <button
          onClick={() => createSession()}
          className="relative w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#9370ff] to-[#C084FC] hover:from-[#a080ff] hover:to-[#d0a0ff] text-white text-[13px] font-semibold transition-all shadow-[0_0_20px_-4px_rgba(147,112,255,0.3)] hover:shadow-[0_0_28px_-4px_rgba(147,112,255,0.5)] hover:scale-[1.02] active:scale-[0.98] sparkle-once"
        >
          <span className="text-base">+</span>
          New chat
        </button>
      </div>

      {/* Nav pills */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={onOpenSkills}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full bg-bg-elevated hover:bg-bg-surface border border-border hover:border-accent/30 text-[12px] text-fg-muted hover:text-fg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles size={13} className="text-accent" />
          Skills
        </button>
        <button
          onClick={onOpenConnectors}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-full bg-bg-elevated hover:bg-bg-surface border border-border hover:border-accent/30 text-[12px] text-fg-muted hover:text-fg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plug size={13} className="text-accent" />
          Connectors
        </button>
      </div>

      {/* Tasks */}
      <div className="pt-2">
        <TasksList />
      </div>

      {/* History */}
      <div className="flex-1 flex flex-col overflow-hidden pt-2">
        <div className="px-5 pb-2 text-[11px] text-fg-dim font-medium uppercase tracking-wider">Chats</div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-bg-elevated border border-border rounded-full pl-8 pr-3 py-2 text-[12px] text-fg placeholder:text-fg-dim focus:outline-none focus:border-accent/40 focus:shadow-[0_0_0_3px_rgba(147,112,255,0.1)] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
          {filtered.length === 0 && (
            <div className="text-[12px] text-fg-dim px-3 py-8 text-center">
              {sessions.length === 0 ? "No chats yet" : "No results"}
            </div>
          )}
          {filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className={clsx(
                "group flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]",
                activeSessionId === s.id
                  ? "bg-bg-surface border border-accent/20 shadow-card shadow-accent/5"
                  : "border border-transparent text-fg-muted hover:bg-bg-elevated hover:text-fg hover:border-border hover:shadow-[inset_2px_0_8px_-4px_rgba(147,112,255,0.2)]"
              )}
            >
              <div className={clsx(
                "w-1 h-8 rounded-full flex-shrink-0 transition-colors",
                activeSessionId === s.id ? "bg-accent" : "bg-transparent group-hover:bg-fg-dim/30"
              )} />
              <MessageSquare
                size={13}
                className={clsx(
                  "flex-shrink-0",
                  activeSessionId === s.id ? "text-accent-hover" : "text-fg-dim"
                )}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[12px] truncate block">{s.title}</span>
                <span className="text-[10px] text-fg-dim">{timeAgo(s.updatedAt)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-fg-dim hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-400/10"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — user profile */}
      <div className="px-4 py-4 flex items-center gap-3 border-t border-transparent" style={{borderImage: 'linear-gradient(to right, transparent, rgba(147,112,255,0.2), transparent) 1'}}>
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent via-[#c084fc] to-accent-hover flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 shadow-card">
            A
          </div>
          {connection === "online" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#4ade80] border-2 border-bg green-pulse" />
          )}
          {connection === "offline" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#f87171] border-2 border-bg" />
          )}
          {connection === "checking" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#fbbf24] border-2 border-bg pulse-dot" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] text-fg font-medium truncate">Anubhav</div>
          <div className="text-[11px] text-fg-dim">
            {connection === "online" ? "Online" : connection === "offline" ? "Offline" : "Connecting..."}
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl hover:bg-bg-surface text-fg-dim hover:text-fg transition-all hover:scale-105 active:scale-95"
          title="Settings"
        >
          <SettingsIcon size={15} />
        </button>
      </div>
    </aside>
    </>
  );
}
