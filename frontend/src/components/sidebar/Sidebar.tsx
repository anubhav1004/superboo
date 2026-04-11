import { useState } from "react";
import {
  LogOut,
  MessageSquare,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Plug,
  Search,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../store/chat";
import { useUserStore } from "../../store/user";
import { isDesktopApp } from "../../lib/desktop";

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
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#38151F" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#38151F" />
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#38151F" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25" />
      <defs>
        <radialGradient id="ghostGradSidebar" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF4EA" />
          <stop offset="52%" stopColor="#F48E8C" />
          <stop offset="100%" stopColor="#E76464" />
        </radialGradient>
      </defs>
    </svg>
  );
}

interface Props {
  onOpenSettings: () => void;
  onOpenSkills: () => void;
  onOpenConnectors: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
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
    guideModeActive,
    toggleGuideMode,
  } = useChatStore();
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const desktop = isDesktopApp();
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const filtered = sessions.filter((session) =>
    session.title.toLowerCase().includes(query.toLowerCase())
  );

  const userName = user?.name || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();
  const plan = user?.plan || "Free";
  const connectionLabel =
    connection === "online"
      ? "Bridge live"
      : connection === "offline"
        ? "Bridge offline"
        : "Checking";

  const handleCreateSession = () => {
    createSession();
    if (isMobile && sidebarOpen) {
      toggleSidebar();
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSession(id);
    if (isMobile && sidebarOpen) {
      toggleSidebar();
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  if (!sidebarOpen && !isMobile) {
    return (
      <div
        className={clsx(
          "hidden md:flex h-full flex-col items-center gap-3 rounded-[18px] border p-3",
          desktop
            ? "desktop-sidebar-rail"
            : "w-14 border-[rgba(255,255,255,0.08)] bg-[rgba(18,10,32,0.85)]"
        )}
      >
        <button
          onClick={toggleSidebar}
          className="desktop-rail-button"
          title="Expand sidebar"
          type="button"
        >
          <PanelLeft size={16} />
        </button>

        <div className="desktop-rail-logo">
          <GhostIcon size={22} />
        </div>

        <button
          onClick={handleCreateSession}
          className="desktop-rail-button desktop-rail-button--accent"
          title="New chat"
          type="button"
        >
          <Plus size={15} />
        </button>
        <button
          onClick={onOpenSkills}
          className="desktop-rail-button"
          title="Skills"
          type="button"
        >
          <Sparkles size={15} />
        </button>
        <button
          onClick={onOpenConnectors}
          className="desktop-rail-button"
          title="Connectors"
          type="button"
        >
          <Plug size={15} />
        </button>

        <div className="flex-1" />

        <button
          onClick={onOpenSettings}
          className="desktop-rail-button"
          title="Settings"
          type="button"
        >
          <Settings2 size={15} />
        </button>
      </div>
    );
  }

  return (
    <>
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={clsx(
          "flex h-full flex-col overflow-hidden",
          isMobile
            ? "fixed inset-y-0 left-0 z-50 w-[280px]"
            : "w-[292px]",
          desktop ? "desktop-sidebar-panel" : "bg-[rgba(16,10,32,0.9)] border-r border-white/10"
        )}
      >
        <div className="flex items-center gap-3 px-4 pb-4 pt-5">
          <button
            onClick={() => navigate("/chat")}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-[16px] text-left"
            type="button"
          >
            <div className="desktop-brand-mark">
              <GhostIcon size={24} />
            </div>
            <div className="min-w-0">
              <div className="desktop-sidebar-title">Superboo</div>
              <div className="desktop-sidebar-subtitle">Desktop workspace</div>
            </div>
          </button>

          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="desktop-ghost-button"
              title="Collapse sidebar"
              type="button"
            >
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={handleCreateSession}
            className="desktop-primary-button"
            type="button"
          >
            <Plus size={16} />
            <span>New chat</span>
          </button>
        </div>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenSkills}
              className="desktop-utility-button"
              type="button"
            >
              <Sparkles size={14} />
              <span>Skills</span>
            </button>
            <button
              onClick={onOpenConnectors}
              className="desktop-utility-button"
              type="button"
            >
              <Plug size={14} />
              <span>Connect</span>
            </button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <button
            onClick={toggleGuideMode}
            className="desktop-utility-button"
            style={{
              width: "100%",
              background: guideModeActive ? "rgba(147,112,255,0.2)" : undefined,
              borderColor: guideModeActive ? "rgba(147,112,255,0.4)" : undefined,
            }}
            type="button"
          >
            <span style={{ fontSize: 14 }}>{"\ud83e\udded"}</span>
            <span>Guide</span>
          </button>
        </div>

        <div className="px-4 pb-3">
          <label className="desktop-section-label" htmlFor="superboo-chat-search">
            Recent chats
          </label>
          <div className="desktop-search-shell">
            <Search size={14} className="desktop-search-icon" />
            <input
              id="superboo-chat-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations"
              className="desktop-search-input"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-1.5">
            {filtered.length === 0 && (
              <div className="desktop-empty-list">
                {sessions.length === 0 ? "No chats yet" : "No matching chats"}
              </div>
            )}

            {filtered.map((session) => {
              const active = activeSessionId === session.id;
              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSelectSession(session.id);
                    }
                  }}
                  className={clsx(
                    "desktop-session-card",
                    active && "desktop-session-card--active"
                  )}
                  role="button"
                  tabIndex={0}
                >
                  <div className="desktop-session-icon">
                    <MessageSquare size={14} />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="desktop-session-title">{session.title}</div>
                    <div className="desktop-session-meta">
                      <span>{timeAgo(session.updatedAt)}</span>
                      <span>{Math.max(session.messages.length, 1)} items</span>
                    </div>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="desktop-session-delete"
                    title="Delete chat"
                    type="button"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-3 pb-3">
          <div className="desktop-user-card">
            <div className="desktop-user-avatar-wrap">
              <div className="desktop-user-avatar">{userInitial}</div>
              <span
                className={clsx(
                  "desktop-user-presence",
                  connection === "online" && "desktop-user-presence--online",
                  connection === "offline" && "desktop-user-presence--offline",
                  connection === "checking" && "desktop-user-presence--checking"
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="desktop-user-name">{userName}</div>
              <div className="desktop-user-meta">
                <span>{plan}</span>
                <span>{connectionLabel}</span>
              </div>
            </div>

            <button
              onClick={onOpenSettings}
              className="desktop-ghost-button"
              title="Settings"
              type="button"
            >
              <Settings2 size={15} />
            </button>
            <button
              onClick={handleSignOut}
              className="desktop-ghost-button desktop-ghost-button--danger"
              title="Sign out"
              type="button"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
