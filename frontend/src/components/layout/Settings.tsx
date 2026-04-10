import { useState } from "react";
import { X, Check, Loader2, Trash2, Keyboard } from "lucide-react";
import { useChatStore } from "../../store/chat";
import { getConfig, setConfig, checkHealth } from "../../lib/api";
import clsx from "clsx";

interface Props {
  onClose: () => void;
}

function GhostSettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#ghostGradSettings)"
      />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <defs>
        <radialGradient id="ghostGradSettings" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function Settings({ onClose }: Props) {
  const current = getConfig();
  const [url, setUrl] = useState(current.url);
  const [token, setToken] = useState(current.token);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<
    { ok: boolean; latency: number; error?: string } | null
  >(null);
  const setConnection = useChatStore((s) => s.setConnection);

  const handleSave = () => {
    setConfig({ url, token });
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    setConfig({ url, token });
    const res = await checkHealth();
    setTestResult(res);
    setConnection(res.ok ? "online" : "offline", res.latency);
    setTesting(false);
  };

  const handleClearData = () => {
    if (confirm("Clear all local sessions, messages, and tasks?")) {
      localStorage.removeItem("superboo-ui-v1");
      location.reload();
    }
  };

  const shortcuts = [
    { keys: ["\u2318", "N"], label: "New chat" },
    { keys: ["\u2318", "B"], label: "Toggle sidebar" },
    { keys: ["\u2318", "\u21E7", "K"], label: "Open skills" },
    { keys: ["\u2318", "\u21E7", "J"], label: "Open connectors" },
    { keys: ["\u2318", ","], label: "Settings" },
    { keys: ["\u21B5"], label: "Send message" },
    { keys: ["\u21E7", "\u21B5"], label: "New line" },
  ];

  return (
    <div
      className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-0 md:p-8 fade-in-fast"
      onClick={onClose}
    >
      <div
        className="bg-bg-elevated border-0 md:border border-border rounded-none md:rounded-2xl w-full max-w-xl h-full md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden shadow-modal modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 md:px-6 pt-5 pb-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2.5">
            <GhostSettingsIcon />
            <h2 className="text-base font-semibold text-fg tracking-tight">
              Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 space-y-6">
          {/* Bridge config */}
          <div>
            <div className="text-[11px] font-semibold text-fg-dim tracking-wider uppercase mb-3">
              Boo's Brain
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] text-fg-muted block mb-1.5">
                  Bridge URL
                </label>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="http://34.100.138.134:8100"
                  className="w-full bg-bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-fg focus:outline-none focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(147,112,255,0.1)] transition-all"
                />
              </div>
              <div>
                <label className="text-[12px] text-fg-muted block mb-1.5">
                  Bearer Token
                </label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="oc-bridge-..."
                  className="w-full bg-bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-fg focus:outline-none focus:border-accent/50 focus:shadow-[0_0_0_3px_rgba(147,112,255,0.1)] transition-all"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleTest}
                  disabled={testing}
                  className="text-xs font-medium px-4 py-2 rounded-full border border-border hover:border-accent/40 text-fg-muted hover:text-fg transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  {testing ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Check size={11} />
                  )}
                  Test connection
                </button>
                {testResult && (
                  <div
                    className={clsx(
                      "text-[11px] font-medium",
                      testResult.ok ? "text-[#4ade80]" : "text-[#f87171]"
                    )}
                  >
                    {testResult.ok
                      ? `Connected \u00B7 ${testResult.latency}ms`
                      : `Failed \u00B7 ${testResult.error || "no response"}`}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div>
            <div className="text-[11px] font-semibold text-fg-dim tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <Keyboard size={12} />
              Shortcuts
            </div>
            <div className="space-y-1">
              {shortcuts.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-bg-surface transition-colors"
                >
                  <span className="text-xs text-fg-muted">{s.label}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-1 rounded-lg border border-border bg-bg text-fg-muted min-w-[24px] text-center shadow-sm"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data */}
          <div>
            <div className="text-[11px] font-semibold text-fg-dim tracking-wider uppercase mb-3">
              Local Data
            </div>
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 text-xs font-medium px-4 py-2.5 rounded-full border border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/[0.05] hover:border-[#f87171] transition-all hover:scale-105 active:scale-95"
            >
              <Trash2 size={11} />
              Clear all chats & tasks
            </button>
          </div>
        </div>

        <div className="border-t border-border px-4 md:px-6 py-3.5 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="text-xs font-medium px-4 py-2.5 rounded-full text-fg-muted hover:text-fg hover:bg-bg-surface transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-xs font-semibold px-5 py-2.5 rounded-full bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-[#b39dff] text-white shadow-card hover:shadow-glow transition-all hover:scale-105 active:scale-95"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
