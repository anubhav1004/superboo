import { useRef, useState, useEffect, type CSSProperties } from "react";
import {
  ArrowUp,
  Code,
  FileText,
  Flame,
  Image as ImageIcon,
  Mic,
  Plug,
  Plus,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useChatStore } from "../../store/chat";
import { isDesktopApp } from "../../lib/desktop";

interface Props {
  onSend: (text: string, files: File[]) => void;
  disabled?: boolean;
  isHub?: boolean;
}

const TRENDING_PILLS = [
  {
    label: "TikTok video",
    prompt: "Create a 15-second TikTok about my new coffee shop opening this weekend",
    color: "#FF8A5B",
  },
  {
    label: "Pitch deck",
    prompt: "Create a 10-slide pitch deck for my AI-powered fitness app startup",
    color: "#69D8C4",
  },
  {
    label: "Meme",
    prompt: "Create a funny meme about procrastinating on assignments using the Drake format",
    color: "#F48E8C",
  },
  {
    label: "Resume",
    prompt: "Write a resume for a recent computer science graduate looking for frontend developer roles",
    color: "#7BC0FF",
  },
  {
    label: "Logo design",
    prompt: "Design a minimal logo for my streetwear brand called 'Drift'",
    color: "#F3C969",
  },
];

export default function MessageInput({ onSend, disabled, isHub }: Props) {
  const { setCreatePanelOpen, setConnectorsOpen } = useChatStore();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [recording, setRecording] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [sendBounce, setSendBounce] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const desktop = isDesktopApp();

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && files.length === 0) return;
    setSendBounce(true);
    setTimeout(() => setSendBounce(false), 300);
    onSend(trimmed, files);
    setText("");
    setFiles([]);
  };

  const handleKey = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = async () => {
        new Blob(chunks, { type: "audio/webm" });
        setText((prev) => prev + " [voice memo recorded]");
        stream.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (err) {
      console.error("mic error", err);
    }
  };

  const fileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon size={12} />;
    if (file.type.startsWith("video/")) return <Video size={12} />;
    if (file.name.match(/\.(js|ts|py|go|rs|tsx|jsx)$/)) return <Code size={12} />;
    return <FileText size={12} />;
  };

  const canSend = !disabled && (text.trim() || files.length > 0);

  return (
    <div
      className={clsx(
        desktop ? "px-0" : "px-4 md:px-8 pt-2 pb-4 md:pb-6",
        isHub && desktop && "w-full",
        isHub && !desktop && "pb-5 md:pb-8"
      )}
    >
      <div className={clsx(desktop ? "w-full" : "max-w-full md:max-w-3xl mx-auto")}>
        {files.length > 0 && (
          <div className={clsx("flex flex-wrap gap-2", desktop ? "mb-3" : "mb-2 px-1")}>
            {files.map((file, index) => (
              <span
                key={`${file.name}-${index}`}
                className={clsx(
                  "fade-in-fast inline-flex items-center gap-1.5 rounded-full text-xs",
                  desktop ? "desktop-file-chip" : "px-3 py-1.5 text-fg-muted"
                )}
                style={
                  desktop
                    ? undefined
                    : {
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {fileIcon(file)}
                <span className="truncate max-w-[180px]">{file.name}</span>
                <button
                  onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                  className="hover:text-red-400 transition-colors"
                  type="button"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div
          className={clsx(
            desktop
              ? "desktop-composer"
              : "relative rounded-2xl transition-all duration-200 ambient-glow noise-bg",
            disabled && "opacity-60"
          )}
          style={
            desktop
              ? undefined
              : {
                  background: "rgba(255,255,255,0.05)",
                  border: focused
                    ? "1px solid rgba(147,112,255,0.4)"
                    : "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(12px)",
                  boxShadow: focused ? "0 0 0 3px rgba(147,112,255,0.15)" : "none",
                }
          }
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div
            className={clsx(
              desktop
                ? "desktop-composer__tools"
                : "absolute top-2 right-3 z-10 flex items-center gap-1.5 transition-opacity duration-200",
              !desktop &&
                ((focused || hovered) ? "opacity-100" : "opacity-0 pointer-events-none")
            )}
          >
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setCreatePanelOpen(true)}
              className={desktop ? "desktop-floating-chip" : "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-fg-dim hover:text-fg transition-all hover:scale-105 active:scale-95"}
              style={
                desktop
                  ? undefined
                  : {
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              <Sparkles size={12} />
              <span>Skills</span>
            </button>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setConnectorsOpen(true)}
              className={desktop ? "desktop-floating-chip" : "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-fg-dim hover:text-fg transition-all hover:scale-105 active:scale-95"}
              style={
                desktop
                  ? undefined
                  : {
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }
              }
            >
              <Plug size={12} />
              <span>Connect</span>
            </button>
          </div>

          {!desktop && (
            <div
              className={clsx(
                "h-[1px] mx-4 transition-opacity duration-300",
                focused ? "opacity-100" : "opacity-0"
              )}
              style={{
                background:
                  "linear-gradient(to right, transparent, rgba(147,112,255,0.4), rgba(236,72,153,0.3), transparent)",
              }}
            />
          )}

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={
              desktop
                ? "Message Superboo or ask it to build something..."
                : "Describe what you want to create..."
            }
            rows={1}
            className={clsx(
              desktop
                ? "desktop-composer__input"
                : "w-full bg-transparent text-fg placeholder:text-fg-dim resize-none focus:outline-none leading-relaxed relative z-[1]",
              !desktop && (isHub ? "text-[15px] px-5 pt-4 pb-1" : "text-[14px] px-5 pt-3 pb-1")
            )}
            disabled={disabled}
          />

          <div className={desktop ? "desktop-composer__footer" : "flex items-center gap-1.5 px-3 pb-3 pt-1"}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={desktop ? "desktop-round-button" : "w-9 h-9 flex items-center justify-center rounded-full text-fg-muted hover:text-fg transition-all hover:scale-110 active:scale-95"}
                style={!desktop ? { background: "transparent" } : undefined}
                onMouseEnter={(event) => {
                  if (!desktop) event.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(event) => {
                  if (!desktop) event.currentTarget.style.background = "transparent";
                }}
                title="Attach file"
                type="button"
              >
                <Plus size={desktop ? 15 : 17} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(event) => handleFiles(event.target.files)}
                className="hidden"
              />

              <button
                onClick={toggleRecording}
                className={clsx(
                  desktop ? "desktop-round-button" : "w-9 h-9 flex items-center justify-center rounded-full transition-all relative",
                  recording
                    ? "bg-red-500/15 text-red-400 pulse-ring"
                    : desktop
                      ? "text-white/72"
                      : "text-fg-muted hover:text-fg hover:scale-110 active:scale-95"
                )}
                style={!desktop && !recording ? { background: "transparent" } : undefined}
                onMouseEnter={(event) => {
                  if (!desktop && !recording) {
                    event.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }
                }}
                onMouseLeave={(event) => {
                  if (!desktop && !recording) {
                    event.currentTarget.style.background = "transparent";
                  }
                }}
                title="Voice input"
                type="button"
              >
                <Mic size={desktop ? 15 : 16} className={recording ? "pulse-dot" : ""} />
              </button>
            </div>

            {desktop && (
              <div className="desktop-composer__hint">
                <span>Return to send</span>
                <span>Shift-Return for newline</span>
              </div>
            )}

            <div className="flex-1" />

            <button
              onClick={handleSend}
              disabled={!canSend}
              className={clsx(
                desktop ? "desktop-send-button" : "w-10 h-10 flex items-center justify-center rounded-full transition-all",
                !desktop &&
                  (canSend
                    ? "text-white hover:scale-110 active:scale-90"
                    : "bg-bg-surface text-fg-dim cursor-not-allowed opacity-50"),
                sendBounce && "bounce-send",
                !canSend && desktop && "desktop-send-button--disabled"
              )}
              style={
                !desktop && canSend
                  ? {
                      background: "linear-gradient(135deg, #9370ff, #EC4899)",
                      boxShadow: "0 0 30px -5px rgba(147,112,255,0.4)",
                    }
                  : undefined
              }
              title="Send"
              type="button"
            >
              <ArrowUp size={desktop ? 15 : 18} />
            </button>
          </div>
        </div>

        {isHub && (
          <div className={desktop ? "desktop-trending-row" : "flex gap-2 mt-3 flex-wrap justify-center"}>
            {TRENDING_PILLS.map((pill) => (
              <button
                key={pill.label}
                onClick={() => onSend(pill.prompt, [])}
                className={desktop ? "desktop-trending-pill" : "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"}
                style={
                  desktop
                    ? ({ "--pill-accent": pill.color } as CSSProperties)
                    : ({
                        background: `${pill.color}15`,
                        border: `1px solid ${pill.color}30`,
                      } as CSSProperties)
                }
                type="button"
              >
                <Flame size={10} style={{ color: pill.color }} />
                {pill.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
