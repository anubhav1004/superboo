import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  Activity,
  Command,
  Cpu,
  Plus,
  Plug,
  Settings2,
} from "lucide-react";
import { useChatStore } from "./store/chat";
import { useUserStore } from "./store/user";
import Sidebar from "./components/sidebar/Sidebar";
import ChatWindow from "./components/chat/ChatWindow";
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
  onOpenConnectors,
}: {
  onOpenSettings: () => void;
  onOpenSkills: () => void;
  onOpenConnectors: () => void;
}) {
  const {
    sessions,
    activeSessionId,
    createSession,
    connection,
    latency,
    model,
  } = useChatStore();
  const { user } = useUserStore();

  const session = sessions.find((item) => item.id === activeSessionId) ?? null;
  const statusLabel =
    connection === "online"
      ? latency
        ? `${latency} ms`
        : "Connected"
      : connection === "offline"
        ? "Offline"
        : "Checking";

  return (
    <header className="desktop-titlebar app-drag">
      <div className="desktop-titlebar__brand">
        <div className="desktop-titlebar__logo">S</div>
        <div className="desktop-titlebar__copy">
          <span className="desktop-titlebar__title">Superboo</span>
          <span className="desktop-titlebar__subtitle">
            {session?.title || "Your desktop AI studio"}
          </span>
        </div>
      </div>

      <div className="desktop-titlebar__center">
        <button
          onClick={onOpenSkills}
          className="desktop-command-pill app-no-drag"
          type="button"
        >
          <Command size={14} />
          <span>Create with skills</span>
          <kbd>Shift-Command-K</kbd>
        </button>
      </div>

      <div className="desktop-titlebar__actions app-no-drag">
        <div className="desktop-status-pill" data-state={connection}>
          <Activity size={13} />
          <span>{statusLabel}</span>
        </div>
        <div className="desktop-status-pill">
          <Cpu size={13} />
          <span>{model}</span>
        </div>
        <div className="desktop-status-pill desktop-status-pill--muted">
          <span>{user?.plan || "Free"} plan</span>
        </div>
        <button
          onClick={() => createSession()}
          className="desktop-icon-button"
          title="New chat"
          type="button"
        >
          <Plus size={15} />
        </button>
        <button
          onClick={onOpenConnectors}
          className="desktop-icon-button"
          title="Connectors"
          type="button"
        >
          <Plug size={15} />
        </button>
        <button
          onClick={onOpenSettings}
          className="desktop-icon-button"
          title="Settings"
          type="button"
        >
          <Settings2 size={15} />
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
