import { useEffect, useRef } from "react";
import { useChatStore, uid } from "../../store/chat";
import { useUserStore } from "../../store/user";
import Message from "./Message";
import MessageInput from "./MessageInput";
import { sendChatWithPolling } from "../../lib/api";
import { Menu, Sparkles, ArrowRight } from "lucide-react";

/* ── Ghost SVG ── */
function BooAvatar({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128">
      <path d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z" fill="url(#gChat)"/>
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#gChat)"/>
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#gChat)"/>
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764"/>
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764"/>
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764"/>
      <circle cx="50" cy="54" r="2.5" fill="white"/>
      <circle cx="74" cy="54" r="2.5" fill="white"/>
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25"/>
      <defs>
        <radialGradient id="gChat" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF"/><stop offset="50%" stopColor="#C084FC"/><stop offset="100%" stopColor="#6D28D9"/>
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── Curated quick-start cards (not all 20 skills) ── */
const QUICK_START = [
  { emoji: "🎬", title: "Create a TikTok", desc: "15s video with captions & music", prompt: "Create a 15-second TikTok about my new coffee shop opening this weekend", color: "#EC4899" },
  { emoji: "📊", title: "Make a pitch deck", desc: "10 polished slides from your idea", prompt: "Create a 10-slide pitch deck for my AI-powered fitness app startup", color: "#22C55E" },
  { emoji: "📝", title: "Write my resume", desc: "Professional, ATS-friendly PDF", prompt: "Write a one-page resume for a CS graduate looking for frontend developer roles", color: "#22C55E" },
  { emoji: "📚", title: "Study guide", desc: "Summaries + flashcards for any subject", prompt: "Create a study guide for AP Biology Chapter 12 — cell division and mitosis", color: "#06B6D4" },
  { emoji: "🍕", title: "Plan my meals", desc: "Weekly plan + grocery list on a budget", prompt: "Plan a week of healthy meals for under $50 — I'm vegetarian and meal-prepping on Sunday", color: "#F43F5E" },
  { emoji: "💼", title: "Prep for interview", desc: "Practice questions + model answers", prompt: "Give me 10 common product manager interview questions and help me practice", color: "#EAB308" },
];

export default function ChatWindow() {
  const {
    sessions,
    activeSessionId,
    addMessage,
    updateMessage,
    createSession,
    renameSession,
    toggleSidebar,
    setCreatePanelOpen,
  } = useChatStore();
  const { user } = useUserStore();

  const session = sessions.find((s) => s.id === activeSessionId) ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [session?.messages]);

  const handleSend = async (text: string, files: File[]) => {
    let sid = activeSessionId;
    const current = sessions.find((s) => s.id === sid);
    if (!sid) sid = createSession(text.slice(0, 40) || "New chat");
    else if (current && current.messages.length === 0) renameSession(sid, text.slice(0, 40) || "New chat");

    addMessage(sid, {
      id: uid(), role: "user", content: text,
      attachments: files.map((f) => ({ id: uid(), name: f.name, type: f.type.startsWith("image/") ? "image" : f.type.startsWith("video/") ? "video" : "document", size: f.size })),
      createdAt: Date.now(),
    });

    const asstId = uid();
    const initSteps = [
      { label: "Sending to Boo...", state: "active" as const, icon: "send" as const },
      { label: "Boo is on it...", state: "pending" as const, icon: "think" as const },
      { label: "Almost there...", state: "pending" as const, icon: "receive" as const },
      { label: "Wrapping up...", state: "pending" as const, icon: "render" as const },
    ];
    addMessage(sid, { id: asstId, role: "assistant", content: "", streaming: true, execSteps: initSteps, createdAt: Date.now() });

    const setStep = (idx: number) => {
      updateMessage(sid, asstId, {
        execSteps: initSteps.map((s, i) => ({
          ...s, state: i < idx ? "done" as const : i === idx ? "active" as const : "pending" as const,
        })),
      });
    };

    try {
      const uiContext = `[system: You are Superboo, a friendly AI that creates things for people. IMPORTANT: This message is from the Superboo Web UI. Reply directly as an assistant message. Do NOT use the send tool. Do NOT send to WhatsApp or Discord. Just reply inline. Include file paths for any media you generate.]\n`;
      const attachmentNote = files.length ? `[attachments: ${files.map((f) => f.name).join(", ")}]\n` : "";

      // Always use the main agent session — OpenClaw expects this format
      const sessionKey = "agent:main:main";
      const reply = await sendChatWithPolling(
        uiContext + attachmentNote + text, sessionKey,
        (step, progress) => {
          if (step === "sending") setStep(0);
          else if (step === "thinking") setStep(1);
          else if (step === "polling") {
            setStep(1);
            if (progress) updateMessage(sid, asstId, {
              execSteps: initSteps.map((s, i) => ({ ...s, state: i < 1 ? "done" as const : i === 1 ? "active" as const : "pending" as const, label: i === 1 ? progress : s.label })),
            });
          } else if (step === "done") setStep(3);
        }
      );

      updateMessage(sid, asstId, { content: reply, streaming: false, execSteps: initSteps.map((s) => ({ ...s, state: "done" as const })) });
      setTimeout(() => updateMessage(sid, asstId, { execSteps: undefined }), 2000);
    } catch (err: unknown) {
      updateMessage(sid, asstId, { content: `**Oops!** Something went wrong.\n\n\`${err instanceof Error ? err.message : String(err)}\``, streaming: false, execSteps: undefined });
    }
  };

  /* ═══════ EMPTY STATE — Prompt-first workspace ═══════ */
  if (!session || session.messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden" style={{background: '#0c0118'}}>
        {/* Mobile header */}
        <div className="flex md:hidden items-center px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
          <button onClick={toggleSidebar} className="p-2 -ml-1 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Menu size={20} />
          </button>
        </div>

        {/* Subtle mesh gradient blob for empty state */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20" style={{background: 'radial-gradient(ellipse, rgba(147,112,255,0.3) 0%, rgba(236,72,153,0.15) 40%, transparent 70%)', filter: 'blur(80px)'}} />
        </div>

        {/* Centered content — prompt bar is the hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 relative z-10">
          <div className="w-full max-w-2xl flex flex-col items-center">

            {/* Ghost + greeting */}
            <div className="ghost-float mb-6 relative">
              <div className="absolute inset-[-12px] rounded-full" style={{background: 'radial-gradient(circle, rgba(147,112,255,0.3), transparent 70%)', filter: 'blur(12px)'}} />
              <div className="relative"><BooAvatar size={56} /></div>
            </div>
            <h1 className="text-[24px] md:text-[32px] font-extrabold tracking-tight text-center mb-2" style={{background: 'linear-gradient(135deg, #C084FC, #EC4899, #9370ff, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              What can Boo create for you{user?.name ? `, ${user.name}` : ""}?
            </h1>
            <p className="text-[13px] text-fg-dim text-center mb-8 max-w-sm">
              Describe what you need in plain words — a video, a deck, a poster, anything.
            </p>

            {/* THE INPUT BAR — front and center */}
            <div className="w-full mb-8">
              <MessageInput onSend={handleSend} isHub />
            </div>

            {/* Quick-start cards — just 6, not 20 */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[11px] text-fg-dim font-medium uppercase tracking-wider">Quick start</span>
                <button
                  onClick={() => setCreatePanelOpen(true)}
                  className="flex items-center gap-1 text-[11px] transition-colors"
                  style={{background: 'linear-gradient(135deg, #C084FC, #EC4899, #9370ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}
                >
                  All 20+ skills <ArrowRight size={10} />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {QUICK_START.map((q) => (
                  <button
                    key={q.title}
                    onClick={() => handleSend(q.prompt, [])}
                    className="group flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ "--c": q.color, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', borderLeft: `2px solid ${q.color}` } as React.CSSProperties}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderLeftColor = q.color; e.currentTarget.style.boxShadow = `0 8px 30px -8px ${q.color}40`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderLeftColor = q.color; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">{q.emoji}</span>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-fg group-hover:text-white transition-colors">{q.title}</div>
                      <div className="text-[11px] text-fg-dim leading-snug mt-0.5">{q.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════ ACTIVE CHAT ═══════ */
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{background: '#0c0118'}}>
      {/* Header */}
      <div className="px-4 md:px-6 py-3 sticky top-0 z-10 border-b border-[rgba(255,255,255,0.08)]" style={{background: 'rgba(12,1,24,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)'}}>
        <div className="max-w-3xl mx-auto w-full flex items-center gap-2.5">
          <button onClick={toggleSidebar} className="p-2 -ml-1 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center md:hidden">
            <Menu size={20} />
          </button>
          <BooAvatar size={22} />
          <div className="text-[14px] text-fg font-medium truncate">{session.title}</div>
          <div className="flex-1" />
          <button onClick={() => setCreatePanelOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-fg-dim hover:text-fg border border-[rgba(255,255,255,0.08)] hover:border-[rgba(147,112,255,0.4)] transition-all" style={{background: 'rgba(255,255,255,0.04)'}}>
            <Sparkles size={11} /> {"\u2728"} Skills
          </button>
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
