import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  Plus,
  Settings2,
} from "lucide-react";
import { useChatStore } from "./store/chat";
import { useUserStore } from "./store/user";
import Sidebar from "./components/sidebar/Sidebar";
import ChatWindow from "./components/chat/ChatWindow";
import GuideMode from "./components/guide/GuideMode";
import SkillsPanel from "./components/skills/SkillsPanel";
import ConnectorsPanel from "./components/connectors/ConnectorsPanel";
import TaskDetail from "./components/tasks/TaskDetail";
import Settings from "./components/layout/Settings";
import LandingPage from "./components/landing/LandingPage";
import AuthPage from "./components/auth/AuthPage";
import OnboardingPage from "./components/auth/OnboardingPage";
import BotMarketplace from "./components/bots/BotMarketplace";
import BotChat from "./components/bots/BotChat";
import AgentPage from "./components/agent/AgentPage";
import PricingPage from "./components/pricing/PricingPage";
import DownloadPage from "./components/download/DownloadPage";
import { useHealth } from "./hooks/useHealth";
import { useKeyboard } from "./hooks/useKeyboard";
import { isDesktopApp, isMacDesktop } from "./lib/desktop";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUserStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function DesktopTitleBar({
  onOpenSettings,
  onOpenSkills,
}: {
  onOpenSettings: () => void;
  onOpenSkills: () => void;
  onOpenConnectors: () => void;
}) {
  const { createSession, connection, guideModeActive, toggleGuideMode } = useChatStore();

  return (
    <header className="app-drag" style={{
      height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 16px 0 80px", /* 80px left for traffic lights */
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(12,1,24,0.6)", backdropFilter: "blur(20px)",
      fontSize: 13, color: "rgba(255,255,255,0.7)", flexShrink: 0,
    }}>
      {/* Left: ghost + Superboo + dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width={18} height={18} viewBox="0 0 128 128">
          <path d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z" fill="url(#gTB)"/>
          <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764"/><ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764"/>
          <circle cx="50" cy="54" r="2.5" fill="white"/><circle cx="74" cy="54" r="2.5" fill="white"/>
          <defs><radialGradient id="gTB" cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#F5E9FF"/><stop offset="50%" stopColor="#C084FC"/><stop offset="100%" stopColor="#6D28D9"/></radialGradient></defs>
        </svg>
        <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.8)", fontSize: 13, letterSpacing: "-0.01em" }}>
          Superboo
        </span>
        {connection === "online" && (
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
        )}
      </div>

      {/* Right: minimal actions */}
      <div className="app-no-drag" style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={toggleGuideMode} type="button" title="Guide Mode (⌘G)"
          style={{ padding: 6, borderRadius: 8, background: guideModeActive ? "rgba(147,112,255,0.2)" : "rgba(255,255,255,0.06)", border: guideModeActive ? "1px solid rgba(147,112,255,0.4)" : "1px solid rgba(255,255,255,0.08)", color: guideModeActive ? "#C084FC" : "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <svg width={14} height={14} viewBox="0 0 128 128"><path d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z" fill="currentColor"/><ellipse cx="52" cy="58" rx="7" ry="9" fill="#0c0118"/><ellipse cx="76" cy="58" rx="7" ry="9" fill="#0c0118"/><circle cx="50" cy="54" r="2.5" fill="white"/><circle cx="74" cy="54" r="2.5" fill="white"/></svg>
        </button>
        <button onClick={onOpenSkills} type="button" title="Skills (⇧⌘K)"
          style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          ✨ Skills
        </button>
        <button onClick={() => createSession()} type="button" title="New chat (⌘N)"
          style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Plus size={14} />
        </button>
        <button onClick={onOpenSettings} type="button" title="Settings (⌘,)"
          style={{ padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Settings2 size={14} />
        </button>
      </div>
    </header>
  );
}

function ChatLayout() {
  const {
    createPanelOpen,
    connectorsOpen,
    settingsOpen,
    setCreatePanelOpen,
    setConnectorsOpen,
    setSettingsOpen,
    activeTaskId,
    guideModeActive,
  } = useChatStore();
  const desktop = isDesktopApp();

  useHealth();
  useKeyboard();

  if (desktop) {
    return (
      <div className="desktop-shell">
        <div className="desktop-shell__ambient desktop-shell__ambient--left" />
        <div className="desktop-shell__ambient desktop-shell__ambient--right" />
        <div className="desktop-shell__ambient desktop-shell__ambient--bottom" />

        <div className="desktop-window-frame">
          <DesktopTitleBar
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenSkills={() => setCreatePanelOpen(true)}
            onOpenConnectors={() => setConnectorsOpen(true)}
          />

          <div className="desktop-window-body">
            <Sidebar
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenSkills={() => setCreatePanelOpen(true)}
              onOpenConnectors={() => setConnectorsOpen(true)}
            />

            <div className="desktop-main-column">
              <div className="desktop-main-surface">
                <ChatWindow />
              </div>
            </div>
          </div>

          {createPanelOpen && <SkillsPanel onClose={() => setCreatePanelOpen(false)} />}
          {connectorsOpen && <ConnectorsPanel onClose={() => setConnectorsOpen(false)} />}
          {activeTaskId && <TaskDetail />}
          {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
        </div>
        {guideModeActive && <GuideMode />}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-bg text-fg overflow-hidden">
      <Sidebar
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenSkills={() => setCreatePanelOpen(true)}
        onOpenConnectors={() => setConnectorsOpen(true)}
      />
      <ChatWindow />
      {createPanelOpen && <SkillsPanel onClose={() => setCreatePanelOpen(false)} />}
      {connectorsOpen && <ConnectorsPanel onClose={() => setConnectorsOpen(false)} />}
      {activeTaskId && <TaskDetail />}
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
      {guideModeActive && <GuideMode />}
    </div>
  );
}

export default function App() {
  const Router = isDesktopApp() ? HashRouter : BrowserRouter;
  const homeElement = isDesktopApp() ? <Navigate to="/chat" replace /> : <LandingPage />;

  return (
    <Router>
      <Routes>
        <Route path="/" element={homeElement} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/onboarding"
          element={
            <OnboardingGuard>
              <OnboardingPage />
            </OnboardingGuard>
          }
        />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/bots" element={<BotMarketplace />} />
        <Route path="/bots/:id" element={<BotChat />} />
        {isMacDesktop() && <Route path="/landing" element={<LandingPage />} />}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
