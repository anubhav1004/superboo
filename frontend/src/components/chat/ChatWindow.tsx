import { useEffect, useRef } from "react";
import { useChatStore, uid } from "../../store/chat";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { sendChatWithPolling } from "../../lib/api";
import { Menu, Video, Image, FileText, Smile, TrendingUp } from "lucide-react";

const SUGGESTIONS = [
  { icon: "Video", color: "#EC4899", title: "Create a TikTok", prompt: "Create a 15-second TikTok about my new coffee shop opening this weekend" },
  { icon: "Presentation", color: "#22C55E", title: "Make a deck", prompt: "Create a 10-slide pitch deck for my AI-powered fitness app startup" },
  { icon: "Image", color: "#3B82F6", title: "Design a poster", prompt: "Design a poster for a college music festival happening next month" },
  { icon: "FileText", color: "#22C55E", title: "Write a resume", prompt: "Write a professional resume for a recent CS graduate" },
  { icon: "Smile", color: "#EC4899", title: "Make a meme", prompt: "Create a funny meme about procrastinating on assignments" },
  { icon: "TrendingUp", color: "#EAB308", title: "Research trends", prompt: "What are the top trending topics on TikTok this week?" },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Video: <Video size={18} />,
  Presentation: <FileText size={18} />,
  Image: <Image size={18} />,
  FileText: <FileText size={18} />,
  Smile: <Smile size={18} />,
  TrendingUp: <TrendingUp size={18} />,
};

function GhostEmptyState() {
  return (
    <svg width="80" height="80" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" className="ghost-float drop-shadow-[0_0_40px_rgba(147,112,255,0.5)]">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#ghostGradEmpty)"
      />
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#ghostGradEmpty)" />
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#ghostGradEmpty)" />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25" />
      <defs>
        <radialGradient id="ghostGradEmpty" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function GhostHeaderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#ghostGradHeader)"
      />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <defs>
        <radialGradient id="ghostGradHeader" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function ChatWindow() {
  const {
    sessions,
    activeSessionId,
    addMessage,
    updateMessage,
    createSession,
    renameSession,
    toggleSidebar,
  } = useChatStore();

  const session = sessions.find((s) => s.id === activeSessionId) ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [session?.messages]);

  const handleSend = async (
    text: string,
    files: File[]
  ) => {
    // Ensure session
    let sid = activeSessionId;
    const current = sessions.find((s) => s.id === sid);
    if (!sid) {
      sid = createSession(text.slice(0, 40) || "New chat");
    } else if (current && current.messages.length === 0) {
      renameSession(sid, text.slice(0, 40) || "New chat");
    }

    // User message
    addMessage(sid, {
      id: uid(),
      role: "user",
      content: text,
      attachments: files.map((f) => ({
        id: uid(),
        name: f.name,
        type: f.type.startsWith("image/")
          ? "image"
          : f.type.startsWith("video/")
          ? "video"
          : "document",
        size: f.size,
      })),
      createdAt: Date.now(),
    });

    // Assistant placeholder with execution steps
    const asstId = uid();
    const initSteps = [
      { label: "Sending to Boo...", state: "active" as const, icon: "send" as const },
      { label: "Boo is on it...", state: "pending" as const, icon: "think" as const },
      { label: "Almost there...", state: "pending" as const, icon: "receive" as const },
      { label: "Wrapping up...", state: "pending" as const, icon: "render" as const },
    ];
    addMessage(sid, {
      id: asstId,
      role: "assistant",
      content: "",
      streaming: true,
      execSteps: initSteps,
      createdAt: Date.now(),
    });

    const setStep = (idx: number) => {
      const steps = initSteps.map((s, i) => ({
        ...s,
        state: i < idx ? "done" as const : i === idx ? "active" as const : "pending" as const,
      }));
      updateMessage(sid, asstId, { execSteps: steps });
    };

    try {
      const uiContext = `[system: You are Superboo, a friendly AI that creates things for people. Always include file paths for any media you generate. Be helpful and casual.]\n`;
      const attachmentNote = files.length
        ? `[attachments: ${files.map((f) => f.name).join(", ")}]\n`
        : "";

      const reply = await sendChatWithPolling(
        uiContext + attachmentNote + text,
        "agent:main:main",
        (step, progress) => {
          if (step === "sending") setStep(0);
          else if (step === "thinking") setStep(1);
          else if (step === "polling") {
            setStep(1);
            // Update the thinking label with elapsed time
            if (progress) {
              const steps = initSteps.map((s, i) => ({
                ...s,
                state: i < 1 ? "done" as const : i === 1 ? "active" as const : "pending" as const,
                label: i === 1 ? progress : s.label,
              }));
              updateMessage(sid, asstId, { execSteps: steps });
            }
          } else if (step === "done") setStep(3);
        }
      );

      // Show response immediately
      updateMessage(sid, asstId, {
        content: reply,
        streaming: false,
        execSteps: initSteps.map((s) => ({ ...s, state: "done" as const })),
      });

      // Clear steps after a moment
      setTimeout(() => {
        updateMessage(sid, asstId, { execSteps: undefined });
      }, 2000);
    } catch (err: any) {
      const msg = `**Oops!** Something went wrong.\n\n\`${err.message}\`\n\nCheck Settings or make sure the bridge is running.`;
      updateMessage(sid, asstId, {
        content: msg,
        streaming: false,
        execSteps: undefined,
      });
    }
  };


  // Empty state
  if (!session || session.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col bg-bg h-full overflow-hidden page-enter">
        {/* Mobile header */}
        <div className="flex md:hidden items-center px-4 py-3 border-b border-border/50">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 ml-2">
            <GhostHeaderIcon />
            <span className="text-[14px] font-semibold bg-gradient-to-r from-[#c084fc] to-[#a78bfa] bg-clip-text text-transparent">Superboo</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 bg-grid">
          <div className="w-full max-w-2xl flex flex-col items-center">
            <div className="mb-6 relative">
              {/* Radial glow behind ghost */}
              <div className="absolute inset-0 -m-12 rounded-full bg-[radial-gradient(circle,rgba(147,112,255,0.15)_0%,transparent_70%)] blur-2xl pointer-events-none" />
              <GhostEmptyState />
            </div>
            <h1 className="text-[28px] md:text-[32px] font-bold text-fg mb-2 tracking-tight">
              What do you want to <span className="text-gradient">create</span>?
            </h1>
            <p className="text-[14px] text-fg-muted mb-10 text-center max-w-md">
              Tell me what you need — I'll figure out the rest
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  onClick={() => handleSend(s.prompt, [])}
                  className="group flex items-center gap-3 px-4 py-3.5 rounded-xl bg-bg-elevated hover:bg-bg-surface border border-border hover:border-accent/30 text-left transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-card"
                  style={{ borderLeftWidth: 3, borderLeftColor: s.color }}
                >
                  <span style={{ color: s.color }}>{ICON_MAP[s.icon]}</span>
                  <span className="text-[13px] text-fg-muted group-hover:text-fg font-medium">{s.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <MessageInput onSend={handleSend} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-bg h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 md:px-8 py-3 md:py-3.5 sticky top-0 z-10 bg-bg/80 backdrop-blur-md border-b border-transparent" style={{borderImage: 'linear-gradient(to right, transparent, rgba(147,112,255,0.15), transparent) 1'}}>
        <div className="max-w-full md:max-w-3xl mx-auto w-full flex items-center gap-2.5">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center md:hidden"
          >
            <Menu size={20} />
          </button>
          <GhostHeaderIcon />
          <div className="text-[14px] text-fg font-medium truncate">{session.title}</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {session.messages.map((m) => (
          <Message key={m.id} msg={m} />
        ))}
        <div className="h-4" />
      </div>

      <MessageInput onSend={handleSend} />
    </div>
  );
}
