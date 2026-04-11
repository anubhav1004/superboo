import { useState } from "react";
import {
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Plug,
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
import { useUserStore } from "../../store/user";
import { useNavigate } from "react-router-dom";

interface Props {
  onOpenSettings: () => void;
  onOpenSkills: () => void;
  onOpenConnectors: () => void;
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
  onOpenSettings,
  onOpenSkills,
  onOpenConnectors,
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
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const userName = user?.name || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
  );

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (!sidebarOpen) {
    return (
      <div className="hidden md:flex w-14 border-r border-[rgba(255,255,255,0.08)] flex-col items-center py-5 gap-2" style={{background: 'linear-gradient(to bottom, #100a20, #0c0118 40%)'}}>
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
          title="Expand sidebar"
        >
          <PanelLeft size={18} />
        </button>
        <div className="h-2" />
        <div className="transition-transform hover:scale-110 active:scale-95">
          <GhostIcon size={24} />
        </div>
        <div className="h-2" />
        <button
          onClick={() => createSession()}
          className="p-2 rounded-full bg-gradient-to-br from-accent to-accent-hover text-white shadow-card transition-all hover:scale-110 active:scale-95"
          title="New chat"
        >
          <Plus size={14} />
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
      "border-r border-[rgba(255,255,255,0.08)] flex flex-col h-full",
      isMobile
        ? "fixed inset-y-0 left-0 z-50 w-[240px] shadow-2xl"
        : "w-[240px]"
    )} style={{background: 'linear-gradient(to bottom, #100a20, #0c0118 40%)'}}>
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group cursor-pointer no-underline">
          <div className="transition-transform group-hover:scale-110 group-hover:-translate-y-0.5">
            <GhostIcon size={24} />
          </div>
          <span className="text-[15px] font-extrabold" style={{background: 'linear-gradient(135deg, #C084FC, #EC4899, #9370ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
            Superboo
          </span>
        </a>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-bg-surface text-fg-dim hover:text-fg transition-all hover:scale-105 active:scale-95"
          title="Collapse"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      {/* New chat pill */}
      <div className="px-3 pb-3">
        <button
          onClick={() => createSession()}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-white text-[12px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{background: 'linear-gradient(135deg, #9370ff, #EC4899)', boxShadow: '0 0 30px -5px rgba(147,112,255,0.4)'}}
        >
          <Plus size={14} />
          New
        </button>
      </div>

      {/* Nav — Skills + Connect */}
      <div className="px-3 pb-3 space-y-1">
        <button
          onClick={onOpenSkills}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-fg-muted hover:text-fg transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{background: 'transparent'}}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid transparent'; }}
        >
          <Sparkles size={14} className="text-fg-dim" />
          {"\u2728"} Skills
        </button>
        <button
          onClick={onOpenConnectors}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] text-fg-muted hover:text-fg transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{background: 'transparent'}}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.border = '1px solid transparent'; }}
        >
          <Plug size={14} className="text-fg-dim" />
          {"\uD83D\uDD0C"} Connect
        </button>
      </div>

      {/* History */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pb-2 text-[10px] text-fg-dim font-medium uppercase tracking-wider">Chats</div>

        <div className="px-3 pb-2">
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-dim pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-bg-elevated border border-border rounded-full pl-7 pr-3 py-1.5 text-[11px] text-fg placeholder:text-fg-dim focus:outline-none focus:border-accent/40 focus:shadow-[0_0_0_3px_rgba(147,112,255,0.1)] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
          {filtered.length === 0 && (
            <div className="text-[11px] text-fg-dim px-3 py-6 text-center">
              {sessions.length === 0 ? "No chats yet" : "No results"}
            </div>
          )}
          {filtered.map((s) => (
            <div
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className={clsx(
                "group flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all hover:scale-[1.01]",
                activeSessionId === s.id
                  ? "border-l-2 border-l-[#EC4899] border border-[rgba(255,255,255,0.08)]"
                  : "border border-transparent text-fg-muted hover:text-fg"
              )}
              style={activeSessionId === s.id ? {background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)'} : undefined}
              onMouseEnter={(e) => { if (activeSessionId !== s.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
              onMouseLeave={(e) => { if (activeSessionId !== s.id) { e.currentTarget.style.background = 'transparent'; } }}
            >
              <MessageSquare
                size={12}
                className={clsx(
                  "flex-shrink-0",
                  activeSessionId === s.id ? "text-accent-hover" : "text-fg-dim"
                )}
              />
              <div className="flex-1 min-w-0">
                <span className="text-[11px] truncate block">{s.title}</span>
                <span className="text-[10px] text-fg-dim">{timeAgo(s.updatedAt)}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(s.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-fg-dim hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-400/10"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer — user + settings */}
      <div className="px-3 py-3 flex items-center gap-2.5 border-t border-transparent" style={{borderImage: 'linear-gradient(to right, transparent, rgba(192,132,252,0.3), rgba(236,72,153,0.2), transparent) 1'}}>
        <div className="relative">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0" style={{background: 'linear-gradient(135deg, #9370ff, #EC4899)', boxShadow: '0 0 20px -4px rgba(147,112,255,0.4)'}}>
            {userInitial}
          </div>
          {connection === "online" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#4ade80] border-2 border-bg green-pulse" />
          )}
          {connection === "offline" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#f87171] border-2 border-bg" />
          )}
          {connection === "checking" && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#fbbf24] border-2 border-bg pulse-dot" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-fg font-medium truncate">{userName}</div>
          <div className="text-[10px] text-fg-dim">
            {connection === "online" ? "Online" : connection === "offline" ? "Offline" : "Connecting..."}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="p-1.5 rounded-xl hover:bg-red-400/10 text-fg-dim hover:text-red-400 transition-all hover:scale-105 active:scale-95 text-[10px] font-medium"
          title="Sign out"
        >
          Sign out
        </button>
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-xl hover:bg-bg-surface text-fg-dim hover:text-fg transition-all hover:scale-105 active:scale-95"
          title="Settings"
        >
          <SettingsIcon size={14} />
        </button>
      </div>
    </aside>
    </>
  );
}
