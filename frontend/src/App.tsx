import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useChatStore } from "./store/chat";
import Sidebar from "./components/sidebar/Sidebar";
import ChatWindow from "./components/chat/ChatWindow";
import SkillsPanel from "./components/skills/SkillsPanel";
import ConnectorsPanel from "./components/connectors/ConnectorsPanel";
import TaskDetail from "./components/tasks/TaskDetail";
import Settings from "./components/layout/Settings";
import LandingPage from "./components/landing/LandingPage";
import { useHealth } from "./hooks/useHealth";
import { useKeyboard } from "./hooks/useKeyboard";

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
        <Route path="/chat" element={<ChatLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
