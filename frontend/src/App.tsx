import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { useHealth } from "./hooks/useHealth";
import { useKeyboard } from "./hooks/useKeyboard";

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

  useHealth();
  useKeyboard();

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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
        <Route path="/bots" element={<BotMarketplace />} />
        <Route path="/bots/:id" element={<BotChat />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
