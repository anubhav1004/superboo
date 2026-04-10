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
    skillsOpen,
    connectorsOpen,
    settingsOpen,
    setSkillsOpen,
    setConnectorsOpen,
    setSettingsOpen,
    activeTaskId,
  } = useChatStore();

  useHealth();
  useKeyboard();

  return (
    <div className="flex h-screen w-screen bg-bg text-fg overflow-hidden">
      <Sidebar
        onOpenSkills={() => setSkillsOpen(true)}
        onOpenConnectors={() => setConnectorsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <ChatWindow />
      {skillsOpen && <SkillsPanel onClose={() => setSkillsOpen(false)} />}
      {connectorsOpen && (
        <ConnectorsPanel onClose={() => setConnectorsOpen(false)} />
      )}
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
