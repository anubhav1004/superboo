import { useRef, useState, useEffect } from "react";
import {
  Plus,
  Mic,
  ArrowUp,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Code,
  Flame,
} from "lucide-react";
import clsx from "clsx";

interface Props {
  onSend: (text: string, files: File[]) => void;
  disabled?: boolean;
  isHub?: boolean;
}

const TRENDING_PILLS = [
  { label: "TikTok video", prompt: "Create a 15-second TikTok about my new coffee shop opening this weekend", color: "#F97316" },
  { label: "Pitch deck", prompt: "Create a 10-slide pitch deck for my AI-powered fitness app startup", color: "#22C55E" },
  { label: "Meme", prompt: "Create a funny meme about procrastinating on assignments using the Drake format", color: "#EC4899" },
  { label: "Resume", prompt: "Write a resume for a recent computer science graduate looking for frontend developer roles", color: "#3B82F6" },
  { label: "Logo design", prompt: "Design a minimal logo for my streetwear brand called 'Drift'", color: "#8B5CF6" },
];

export default function MessageInput({ onSend, disabled, isHub }: Props) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [recording, setRecording] = useState(false);
  const [focused, setFocused] = useState(false);
  const [sendBounce, setSendBounce] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 240) + "px";
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

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
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
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        new Blob(chunks, { type: "audio/webm" });
        setText((prev) => prev + " [voice memo recorded]");
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch (err) {
      console.error("mic error", err);
    }
  };

  const fileIcon = (f: File) => {
    if (f.type.startsWith("image/")) return <ImageIcon size={12} />;
    if (f.type.startsWith("video/")) return <Video size={12} />;
    if (f.name.match(/\.(js|ts|py|go|rs|tsx|jsx)$/)) return <Code size={12} />;
    return <FileText size={12} />;
  };

  const canSend = !disabled && (text.trim() || files.length > 0);

  return (
    <div className={clsx("px-4 md:px-8 pb-4 md:pb-6 pt-2", isHub && "pb-5 md:pb-8")}>
      <div className="max-w-full md:max-w-3xl mx-auto">
        {/* Files */}
        {files.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap px-1">
            {files.map((f, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full text-fg-muted fade-in-fast"
                style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)'}}
              >
                {fileIcon(f)}
                <span className="truncate max-w-[160px]">{f.name}</span>
                <button
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="hover:text-red-400 transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input container — glassmorphism */}
        <div
          className={clsx(
            "relative rounded-2xl transition-all duration-200 ambient-glow noise-bg",
            disabled && "opacity-60"
          )}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: focused ? '1px solid rgba(147,112,255,0.4)' : '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            boxShadow: focused ? '0 0 0 3px rgba(147,112,255,0.15)' : 'none',
          }}
        >
          {/* Gradient focus line */}
          <div className={clsx(
            "h-[1px] mx-4 transition-opacity duration-300",
            focused ? "opacity-100" : "opacity-0"
          )} style={{background: 'linear-gradient(to right, transparent, rgba(147,112,255,0.4), rgba(236,72,153,0.3), transparent)'}} />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Describe what you want to create..."
            rows={1}
            className={clsx(
              "w-full bg-transparent text-fg placeholder:text-fg-dim resize-none focus:outline-none leading-relaxed relative z-[1]",
              isHub ? "text-[15px] px-5 pt-4 pb-1" : "text-[14px] px-5 pt-3 pb-1"
            )}
            disabled={disabled}
          />

          <div className="flex items-center gap-1.5 px-3 pb-3 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 flex items-center justify-center rounded-full text-fg-muted hover:text-fg transition-all hover:scale-110 active:scale-95"
              style={{background: 'transparent'}}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              title="Attach file"
            >
              <Plus size={17} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <button
              onClick={toggleRecording}
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-full transition-all relative",
                recording
                  ? "bg-red-500/15 text-red-400 pulse-ring"
                  : "text-fg-muted hover:text-fg hover:scale-110 active:scale-95"
              )}
              style={!recording ? {background: 'transparent'} : undefined}
              onMouseEnter={(e) => { if (!recording) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={(e) => { if (!recording) e.currentTarget.style.background = 'transparent'; }}
              title="Voice input"
            >
              <Mic size={16} className={recording ? "pulse-dot" : ""} />
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={clsx(
                "w-10 h-10 flex items-center justify-center rounded-full transition-all",
                canSend
                  ? "text-white hover:scale-110 active:scale-90"
                  : "bg-bg-surface text-fg-dim cursor-not-allowed opacity-50",
                sendBounce && "bounce-send"
              )}
              style={canSend ? {background: 'linear-gradient(135deg, #9370ff, #EC4899)', boxShadow: '0 0 30px -5px rgba(147,112,255,0.4)'} : undefined}
              title="Send"
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>

        {/* Trending pills (only in hub state) */}
        {isHub && (
          <div className="flex gap-2 mt-3 flex-wrap justify-center">
            {TRENDING_PILLS.map((pill) => (
              <button
                key={pill.label}
                onClick={() => onSend(pill.prompt, [])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
                style={{background: `${pill.color}15`, border: `1px solid ${pill.color}30`}}
              >
                <Flame size={10} style={{color: pill.color}} />
                {pill.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
