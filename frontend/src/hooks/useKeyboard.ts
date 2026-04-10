import { useEffect } from "react";
import { useChatStore } from "../store/chat";

export function useKeyboard() {
  const {
    createSession,
    toggleSidebar,
    setCreatePanelOpen,
    setConnectorsOpen,
    setSettingsOpen,
  } = useChatStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;

      // Don't interfere when typing
      const tag = (e.target as HTMLElement)?.tagName;
      const inEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable;

      if (e.key === "n" && !inEditable) {
        e.preventDefault();
        createSession();
      } else if (e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      } else if (e.key === "k" && e.shiftKey) {
        e.preventDefault();
        setCreatePanelOpen(true);
      } else if (e.key === "j" && e.shiftKey) {
        e.preventDefault();
        setConnectorsOpen(true);
      } else if (e.key === ",") {
        e.preventDefault();
        setSettingsOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    createSession,
    toggleSidebar,
    setCreatePanelOpen,
    setConnectorsOpen,
    setSettingsOpen,
  ]);
}
