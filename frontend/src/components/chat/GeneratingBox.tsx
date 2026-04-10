import { Film, Image, FileText, Music, Loader2 } from "lucide-react";
import clsx from "clsx";

type MediaType = "video" | "image" | "document" | "audio";

interface GeneratingBoxProps {
  type: MediaType;
  progress?: number;
  label?: string;
}

const iconMap = {
  video: Film,
  image: Image,
  document: FileText,
  audio: Music,
};

const labelMap: Record<MediaType, string> = {
  video: "Boo is creating your video",
  image: "Boo is creating your image",
  document: "Boo is generating a document",
  audio: "Boo is creating audio",
};

function MiniGhostSpin() {
  return (
    <svg width="28" height="28" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" className="ghost-float" style={{ animationDuration: "1.2s" }}>
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#ghostGradGen)"
      />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <defs>
        <radialGradient id="ghostGradGen" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function GeneratingBox({ type, progress, label }: GeneratingBoxProps) {
  const Icon = iconMap[type];
  const displayLabel = label || labelMap[type];
  const isWide = type === "video" || type === "audio";

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl",
        "shadow-[0_0_30px_-6px_rgba(147,112,255,0.25)]",
        isWide ? "aspect-video" : "aspect-square",
        "max-w-md w-full"
      )}
      style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(147,112,255,0.3)', backdropFilter: 'blur(12px)'}}
    >
      {/* Shimmer background — purple tinted */}
      <div className="absolute inset-0 shimmer" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        {/* Pulsing ghost */}
        <div className="relative">
          <div className="absolute inset-[-8px] rounded-full bg-accent/15 animate-ping" style={{ animationDuration: "2s" }} />
          <MiniGhostSpin />
        </div>

        {/* Label with animated dots */}
        <div className="flex items-center gap-2 text-[13px] text-fg-muted">
          <Loader2 size={14} className="animate-spin text-accent" />
          <span>{displayLabel}</span>
          <span className="generating-dots" />
        </div>

        {/* Small icon badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-elevated/80 border border-border text-[10px] text-fg-dim">
          <Icon size={11} className="text-accent" />
          <span className="capitalize">{type}</span>
        </div>

        {/* Progress bar */}
        {progress != null && progress >= 0 && (
          <div className="w-32 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
