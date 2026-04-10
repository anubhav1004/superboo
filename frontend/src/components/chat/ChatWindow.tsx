import { useEffect, useRef } from "react";
import { useChatStore, uid } from "../../store/chat";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { sendChatWithPolling } from "../../lib/api";
import { SKILLS } from "../../data/skills";
import { Menu } from "lucide-react";

const SUGGESTIONS = [
  {
    emoji: "\uD83C\uDFAC",
    title: "Make a video",
    prompt:
      "Generate a UGC street interview ad for Professor Curious in Kota with the kota-coaching scene #ugc-street-interview",
  },
  {
    emoji: "\uD83D\uDCC8",
    title: "Grow my account",
    prompt:
      "Kick off the 24/7 growth engine for @professorcurious.ai #growth-engine",
  },
  {
    emoji: "\u2702\uFE0F",
    title: "Edit a clip",
    prompt:
      "Post-process the latest render: warm color grade, hook text overlay, loudnorm audio #video-editor",
  },
  {
    emoji: "\uD83D\uDD0D",
    title: "Research trends",
    prompt:
      "Research the latest trending hooks and formats on TikTok for edtech content",
  },
];

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
    createTaskFromSkill,
    advanceTaskProgress,
    setTaskStatus,
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
    skillTags: string[],
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
      skillTags,
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

    // Create a task if a skill was tagged
    const taskIds: string[] = [];
    for (const skillId of skillTags) {
      const skill = SKILLS.find((s) => s.id === skillId);
      if (!skill) continue;
      const taskId = createTaskFromSkill(
        skillId,
        `${skill.name} — ${text.slice(0, 50)}`,
        sid
      );
      taskIds.push(taskId);
    }

    // Assistant placeholder with execution steps
    const asstId = uid();
    const initSteps = [
      { label: "Sending your message...", state: "active" as const, icon: "send" as const },
      { label: "Boo is thinking...", state: "pending" as const, icon: "think" as const },
      { label: "Getting the response...", state: "pending" as const, icon: "receive" as const },
      { label: "Almost there...", state: "pending" as const, icon: "render" as const },
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
      const uiContext = `[system: You are on the Superboo Web UI. It renders videos/images/docs INLINE from file paths. Always include full file paths. Do NOT send to WhatsApp unless asked.]\n`;
      const skillPreamble = skillTags.length
        ? `[skills: ${skillTags.join(", ")}]\n`
        : "";
      const attachmentNote = files.length
        ? `[attachments: ${files.map((f) => f.name).join(", ")}]\n`
        : "";

      const reply = await sendChatWithPolling(
        uiContext + skillPreamble + attachmentNote + text,
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

      // Advance task progress for tagged skills
      for (const tid of taskIds) {
        for (let i = 0; i < 2; i++) {
          setTimeout(() => advanceTaskProgress(tid), 800 * (i + 1));
        }
      }
    } catch (err: any) {
      const msg = `**Oops!** Something went wrong.\n\n\`${err.message}\`\n\nCheck Settings or make sure the bridge is running.`;
      updateMessage(sid, asstId, {
        content: msg,
        streaming: false,
        execSteps: undefined,
      });
      for (const tid of taskIds) setTaskStatus(tid, "cancelled");
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
              Hey! I'm <span className="text-gradient">Superboo</span>
            </h1>
            <p className="text-[14px] text-fg-muted mb-10 text-center max-w-md">
              Tell me what you need — I'll figure out the rest
            </p>

            <div className="flex flex-wrap gap-2.5 justify-center w-full">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  onClick={() => handleSend(s.prompt, [], [])}
                  className="group chip-shimmer flex items-center gap-2.5 px-5 py-3 rounded-full bg-bg-elevated hover:bg-bg-surface border border-border hover:border-accent/30 text-[13px] text-fg-muted hover:text-fg transition-all hover:scale-[1.03] active:scale-[0.97] hover:shadow-card"
                >
                  <span className="text-base">{s.emoji}</span>
                  {s.title}
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
