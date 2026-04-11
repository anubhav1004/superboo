import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, Menu, PanelRightOpen, Sparkles } from "lucide-react";
import { useChatStore, uid } from "../../store/chat";
import { useUserStore } from "../../store/user";
import Message from "./Message";
import MessageInput from "./MessageInput";
import CanvasPreview from "./CanvasPreview";
import { sendChatWithPolling, detectCreationType, createFile } from "../../lib/api";
import { isDesktopApp } from "../../lib/desktop";

function BooAvatar({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#gChat)"
      />
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#gChat)" />
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#gChat)" />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#38151F" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#38151F" />
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#38151F" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25" />
      <defs>
        <radialGradient id="gChat" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFF4EA" />
          <stop offset="52%" stopColor="#F48E8C" />
          <stop offset="100%" stopColor="#E76464" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const QUICK_START = [
  {
    emoji: "🎬",
    title: "Launch a short video",
    desc: "Story beat, captions, soundtrack, export.",
    prompt: "Create a 15-second TikTok about my new coffee shop opening this weekend",
    color: "#FF8A5B",
  },
  {
    emoji: "📊",
    title: "Build a pitch deck",
    desc: "Ten polished slides from an idea in plain language.",
    prompt: "Create a 10-slide pitch deck for my AI-powered fitness app startup",
    color: "#69D8C4",
  },
  {
    emoji: "📝",
    title: "Write a resume",
    desc: "Clean one-page draft with strong bullets.",
    prompt: "Write a one-page resume for a CS graduate looking for frontend developer roles",
    color: "#F3C969",
  },
  {
    emoji: "📚",
    title: "Make a study guide",
    desc: "Notes, summaries, and flashcards in one pass.",
    prompt: "Create a study guide for AP Biology Chapter 12 — cell division and mitosis",
    color: "#7BC0FF",
  },
  {
    emoji: "🍽️",
    title: "Plan a weekly routine",
    desc: "Meals, groceries, constraints, and timing.",
    prompt: "Plan a week of healthy meals for under $50 — I'm vegetarian and meal-prepping on Sunday",
    color: "#9FE870",
  },
  {
    emoji: "💼",
    title: "Prep for interviews",
    desc: "Questions, model answers, and a practice loop.",
    prompt: "Give me 10 common product manager interview questions and help me practice",
    color: "#F48E8C",
  },
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
  const [canvasFile, setCanvasFile] = useState<string | null>(null);

  const desktop = isDesktopApp();
  const session = sessions.find((item) => item.id === activeSessionId) ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [session?.messages]);

  const handleSend = async (text: string, files: File[]) => {
    let sid = activeSessionId;
    const current = sessions.find((item) => item.id === sid);
    if (!sid) sid = createSession(text.slice(0, 40) || "New chat");
    else if (current && current.messages.length === 0) {
      renameSession(sid, text.slice(0, 40) || "New chat");
    }

    addMessage(sid, {
      id: uid(),
      role: "user",
      content: text,
      attachments: files.map((file) => ({
        id: uid(),
        name: file.name,
        type: file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
            ? "video"
            : "document",
        size: file.size,
      })),
      createdAt: Date.now(),
    });

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
      updateMessage(sid, asstId, {
        execSteps: initSteps.map((step, i) => ({
          ...step,
          state:
            i < idx ? ("done" as const) : i === idx ? ("active" as const) : ("pending" as const),
        })),
      });
    };

    try {
      const creation = detectCreationType(text);
      if (creation) {
        setStep(1);
        const result = await createFile(creation);
        setStep(2);
        if (result.ok && result.file_path) {
          setStep(3);
          const reply = `Done! Here's your ${
            result.file_type === "pptx"
              ? "presentation"
              : result.file_type === "docx"
                ? "document"
                : "spreadsheet"
          }:\n\n${result.file_path}`;
          updateMessage(sid, asstId, {
            content: reply,
            streaming: false,
            execSteps: initSteps.map((step) => ({ ...step, state: "done" as const })),
          });
          setTimeout(
            () => updateMessage(sid, asstId, { execSteps: undefined }),
            2000
          );
          setCanvasFile(result.file_path);
          return;
        }
      }

      const uiContext = `[system: You are Superboo. IMPORTANT RULES:
1. When user asks to CREATE something (deck, slides, document, spreadsheet, image), you MUST use the exec tool to run the creation script. Do NOT just write text — actually CREATE the file.
2. For decks/slides: exec python3 /home/node/.openclaw/skills/generate-slides/scripts/create_slides.py --topic "..." --slides 10 --style modern --output /home/node/.openclaw/workspace/output/FILENAME.pptx
3. For documents/resumes: exec python3 /home/node/.openclaw/skills/generate-document/scripts/create_doc.py --title "..." --type resume --output /home/node/.openclaw/workspace/output/FILENAME.docx
4. For spreadsheets: exec python3 /home/node/.openclaw/skills/generate-spreadsheet/scripts/create_sheet.py --title "..." --output /home/node/.openclaw/workspace/output/FILENAME.xlsx
5. For images: use nano-banana-pro or openai-image-gen skill
6. First write a JSON outline/data file to /tmp/, then pass it to the script with --outline or --data-file or --content-file
7. After creating, include the FULL file path in your response so the UI can render it
8. Do NOT use the send tool. Do NOT send to WhatsApp. Reply inline only.
9. Be brief — create the file, give the path, done.]\n`;
      const attachmentNote = files.length
        ? `[attachments: ${files.map((file) => file.name).join(", ")}]\n`
        : "";
      const sessionKey = "agent:main:main";
      const reply = await sendChatWithPolling(
        uiContext + attachmentNote + text,
        sessionKey,
        (step, progress) => {
          if (step === "sending") setStep(0);
          else if (step === "thinking") setStep(1);
          else if (step === "polling") {
            setStep(1);
            if (progress) {
              updateMessage(sid, asstId, {
                execSteps: initSteps.map((item, index) => ({
                  ...item,
                  state:
                    index < 1
                      ? ("done" as const)
                      : index === 1
                        ? ("active" as const)
                        : ("pending" as const),
                  label: index === 1 ? progress : item.label,
                })),
              });
            }
          } else if (step === "done") setStep(3);
        }
      );

      updateMessage(sid, asstId, {
        content: reply,
        streaming: false,
        execSteps: initSteps.map((step) => ({ ...step, state: "done" as const })),
      });
      setTimeout(() => updateMessage(sid, asstId, { execSteps: undefined }), 2000);

      const fileMatch =
        reply.match(/\/home\/node\/[^\s)"`]+\.(pptx|docx|xlsx|pdf|png|jpg|jpeg|mp4|mov|webm)/i) ||
        reply.match(/\/home\/anubhav\/[^\s)"`]+\.(pptx|docx|xlsx|pdf|png|jpg|jpeg|mp4|mov|webm)/i);
      if (fileMatch) {
        setCanvasFile(fileMatch[0]);
      }
    } catch (err: unknown) {
      updateMessage(sid, asstId, {
        content: `**Oops!** Something went wrong.\n\n\`${err instanceof Error ? err.message : String(err)}\``,
        streaming: false,
        execSteps: undefined,
      });
    }
  };

  if (!session || session.messages.length === 0) {
    return (
      <div className={desktop ? "desktop-chat-stage" : "flex-1 flex flex-col h-full overflow-hidden bg-bg"}>
        {!desktop && (
          <div className="flex md:hidden items-center px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-1 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Menu size={20} />
            </button>
          </div>
        )}

        <div className={desktop ? "desktop-empty-state" : "relative flex-1 flex flex-col items-center justify-center px-4 md:px-6"}>
          {!desktop && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
              <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
                style={{
                  background:
                    "radial-gradient(ellipse, rgba(147,112,255,0.3) 0%, rgba(236,72,153,0.15) 40%, transparent 70%)",
                  filter: "blur(80px)",
                }}
              />
            </div>
          )}

          <div className={desktop ? "desktop-hero-card" : "w-full max-w-2xl flex flex-col items-center relative z-10"}>
            <div className={desktop ? "desktop-hero-header" : "w-full flex flex-col items-center"}>
              <div className={desktop ? "desktop-hero-avatar" : "ghost-float mb-6 relative"}>
                {!desktop && (
                  <div
                    className="absolute inset-[-12px] rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(147,112,255,0.3), transparent 70%)",
                      filter: "blur(12px)",
                    }}
                  />
                )}
                <div className="relative">
                  <BooAvatar size={desktop ? 64 : 56} />
                </div>
              </div>

              <div className={desktop ? "flex-1 min-w-0" : ""}>
                <h1 className={desktop ? "desktop-hero-title" : "text-[24px] md:text-[32px] font-extrabold tracking-tight text-center mb-2 text-gradient"}>
                  What can Boo create for you{user?.name ? `, ${user.name}` : ""}?
                </h1>
                <p className={desktop ? "desktop-hero-subtitle" : "text-[13px] text-fg-dim text-center mb-8 max-w-sm"}>
                  Describe the outcome and Superboo turns it into files, media, drafts, and structured work.
                </p>

                {desktop && (
                  <div className="desktop-hero-pills">
                    <span className="desktop-inline-pill">Files on device</span>
                    <span className="desktop-inline-pill">Bridge-connected</span>
                    <span className="desktop-inline-pill">Desktop-first</span>
                  </div>
                )}
              </div>
            </div>

            <div className={desktop ? "desktop-hero-composer" : "w-full mb-8"}>
              <MessageInput onSend={handleSend} isHub />
            </div>

            <div className="w-full">
              <div className={desktop ? "desktop-quick-header" : "flex items-center justify-between mb-3 px-1"}>
                <span className={desktop ? "desktop-section-kicker" : "text-[11px] text-fg-dim font-medium uppercase tracking-wider"}>
                  Quick start
                </span>
                <button
                  onClick={() => setCreatePanelOpen(true)}
                  className={desktop ? "desktop-text-button" : "flex items-center gap-1 text-[11px] transition-colors text-gradient"}
                  type="button"
                >
                  All skills <ArrowRight size={12} />
                </button>
              </div>

              <div className={desktop ? "desktop-quick-grid" : "grid grid-cols-2 md:grid-cols-3 gap-2.5"}>
                {QUICK_START.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => handleSend(item.prompt, [])}
                    className={desktop ? "desktop-quick-card" : "group flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"}
                    style={
                      desktop
                        ? ({ "--quick-accent": item.color } as CSSProperties)
                        : ({
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            backdropFilter: "blur(12px)",
                            borderLeft: `2px solid ${item.color}`,
                          } as CSSProperties)
                    }
                    type="button"
                  >
                    <span className="text-xl flex-shrink-0">{item.emoji}</span>
                    <div className="min-w-0">
                      <div className="desktop-quick-card__title">{item.title}</div>
                      <div className="desktop-quick-card__desc">{item.desc}</div>
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

  return (
    <div className={desktop ? "desktop-chat-stage desktop-chat-stage--conversation" : "flex-1 flex h-full overflow-hidden bg-bg"}>
      <div
        className={`flex min-w-0 flex-1 flex-col overflow-hidden ${
          canvasFile ? (desktop ? "max-w-[calc(100%-392px)]" : "max-w-[calc(100%-420px)]") : ""
        }`}
      >
        <div
          className={
            desktop
              ? "desktop-chat-header"
              : "px-4 md:px-6 py-3 sticky top-0 z-10 border-b border-[rgba(255,255,255,0.08)]"
          }
          style={
            desktop
              ? undefined
              : {
                  background: "rgba(12,1,24,0.8)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                }
          }
        >
          <div className={desktop ? "desktop-chat-header__inner" : "max-w-3xl mx-auto w-full flex items-center gap-2.5"}>
            <button
              onClick={toggleSidebar}
              className={desktop ? "desktop-ghost-button md:hidden" : "p-2 -ml-1 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all min-w-[44px] min-h-[44px] flex items-center justify-center md:hidden"}
              type="button"
            >
              <Menu size={desktop ? 16 : 20} />
            </button>

            <div className="flex items-center gap-3 min-w-0">
              <div className={desktop ? "desktop-chat-avatar" : ""}>
                <BooAvatar size={desktop ? 28 : 22} />
              </div>
              <div className="min-w-0">
                <div className={desktop ? "desktop-chat-title" : "text-[14px] text-fg font-medium truncate"}>
                  {session.title}
                </div>
                {desktop && (
                  <div className="desktop-chat-subtitle">
                    {session.messages.length} messages in this thread
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1" />

            {desktop && (
              <div className="hidden md:flex items-center gap-2">
                <span className="desktop-inline-pill">Boo ready</span>
                {canvasFile && (
                  <span className="desktop-inline-pill desktop-inline-pill--highlight">
                    Canvas open
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => setCreatePanelOpen(true)}
              className={desktop ? "desktop-toolbar-button" : "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-fg-dim hover:text-fg border border-[rgba(255,255,255,0.08)] hover:border-[rgba(147,112,255,0.4)] transition-all"}
              style={desktop ? undefined : { background: "rgba(255,255,255,0.04)" }}
              type="button"
            >
              <Sparkles size={desktop ? 14 : 11} />
              <span>Skills</span>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className={desktop ? "desktop-message-scroll" : "flex-1 overflow-y-auto"}
        >
          {session.messages.map((message) => (
            <Message key={message.id} msg={message} />
          ))}
          <div className="h-4" />
        </div>

        <div className={desktop ? "desktop-composer-dock" : ""}>
          <MessageInput onSend={handleSend} />
        </div>
      </div>

      {canvasFile && (
        <div className={desktop ? "desktop-canvas-pane hidden md:block" : "hidden md:block"}>
          <div className={desktop ? "desktop-canvas-pane__header" : "hidden"}>
            <span className="desktop-section-kicker">Preview</span>
            <button
              onClick={() => setCanvasFile(null)}
              className="desktop-text-button"
              type="button"
            >
              <PanelRightOpen size={13} />
              Hide
            </button>
          </div>
          <CanvasPreview filePath={canvasFile} onClose={() => setCanvasFile(null)} />
        </div>
      )}
    </div>
  );
}
