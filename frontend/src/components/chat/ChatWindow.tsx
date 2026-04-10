import { useEffect, useRef } from "react";
import { useChatStore, uid } from "../../store/chat";
import { SKILLS, SKILL_CATEGORIES } from "../../data/skills";
import type { Skill } from "../../types";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { sendChatWithPolling } from "../../lib/api";
import {
  Menu,
  Video,
  Image,
  Share2,
  Mic,
  Layout,
  PenTool,
  Wand2,
  Smile,
  Presentation,
  FileText,
  BookOpen,
  Mail,
  Film,
  Headphones,
  Music,
  ScrollText,
  BarChart2,
  Briefcase,
  TrendingUp,
  Search,
  Flame,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "video": Video, "image": Image, "share-2": Share2, "mic": Mic,
  "layout": Layout, "pen-tool": PenTool, "wand-2": Wand2, "smile": Smile,
  "presentation": Presentation, "file-text": FileText, "book-open": BookOpen,
  "mail": Mail, "film": Film, "headphones": Headphones, "music": Music,
  "scroll": ScrollText, "bar-chart-2": BarChart2, "briefcase": Briefcase,
  "trending-up": TrendingUp, "search": Search,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Content Creation": "#EC4899",
  "Design & Visual": "#3B82F6",
  "Presentations & Docs": "#22C55E",
  "Video & Audio": "#F97316",
  "Business & Research": "#EAB308",
};

function GhostEmptyState() {
  return (
    <svg width="64" height="64" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" className="ghost-float drop-shadow-[0_0_40px_rgba(147,112,255,0.5)]">
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

function SkillTile({ skill, onSelect }: { skill: Skill; onSelect: (prompt: string) => void }) {
  const IconComp = ICON_MAP[skill.icon];
  const color = CATEGORY_COLORS[skill.category] || "#7c5cff";

  return (
    <button
      onClick={() => onSelect(skill.examplePrompt)}
      className="group relative flex flex-col gap-2.5 p-4 rounded-2xl bg-[#12121a] border border-[#1f1f2a] hover:border-[#9370ff]/30 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_24px_-8px_rgba(147,112,255,0.15)]"
    >
      {/* Trending badge */}
      {skill.trending && (
        <div className="absolute top-2.5 right-2.5">
          <Flame size={12} className="text-orange-400" />
        </div>
      )}

      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {IconComp && <IconComp size={17} />}
      </div>

      {/* Name */}
      <div className="text-[13px] font-medium text-fg group-hover:text-white transition-colors leading-tight">
        {skill.name}
      </div>

      {/* Description */}
      <div className="text-[11px] text-fg-dim leading-relaxed line-clamp-2">
        {skill.description}
      </div>
    </button>
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

      updateMessage(sid, asstId, {
        content: reply,
        streaming: false,
        execSteps: initSteps.map((s) => ({ ...s, state: "done" as const })),
      });

      setTimeout(() => {
        updateMessage(sid, asstId, { execSteps: undefined });
      }, 2000);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      const msg = `**Oops!** Something went wrong.\n\n\`${errMsg}\`\n\nCheck Settings or make sure the bridge is running.`;
      updateMessage(sid, asstId, {
        content: msg,
        streaming: false,
        execSteps: undefined,
      });
    }
  };


  // Empty state — GenSpark-style hub
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

        {/* Scrollable hub content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col items-center px-4 md:px-8 pt-12 md:pt-16 pb-6">
            {/* Greeting */}
            <div className="mb-4 relative">
              <div className="absolute inset-0 -m-8 rounded-full bg-[radial-gradient(circle,rgba(147,112,255,0.12)_0%,transparent_70%)] blur-2xl pointer-events-none" />
              <GhostEmptyState />
            </div>
            <h1 className="text-[32px] md:text-[40px] font-[200] text-fg mb-2 tracking-tight text-center">
              What do you want to <span className="text-gradient">create</span>?
            </h1>
            <p className="text-[14px] text-fg-muted mb-10 text-center max-w-md">
              Choose a creation type below, or just describe what you need
            </p>

            {/* Agent tiles grouped by category */}
            <div className="w-full max-w-4xl space-y-8">
              {SKILL_CATEGORIES.map((cat) => {
                const catSkills = SKILLS.filter((s) => s.category === cat);
                const catColor = CATEGORY_COLORS[cat] || "#7c5cff";
                return (
                  <div key={cat}>
                    {/* Category label */}
                    <div className="flex items-center gap-2.5 mb-3 px-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                      <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: catColor }}>
                        {cat}
                      </span>
                    </div>

                    {/* Tiles grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {catSkills.map((skill) => (
                        <SkillTile
                          key={skill.id}
                          skill={skill}
                          onSelect={(prompt) => handleSend(prompt, [])}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Prominent input bar */}
        <MessageInput onSend={handleSend} isHub />
      </div>
    );
  }

  // Active chat state
  return (
    <div className="flex-1 flex flex-col bg-bg h-full overflow-hidden">
      {/* Minimal header */}
      <div className="px-4 md:px-8 py-3 sticky top-0 z-10 bg-bg/80 backdrop-blur-md border-b border-transparent" style={{borderImage: 'linear-gradient(to right, transparent, rgba(147,112,255,0.15), transparent) 1'}}>
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
