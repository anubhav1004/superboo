import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import type { Message as MessageType } from "../../types";
import { Wrench, ChevronDown, Copy, Check } from "lucide-react";
import { useState, useMemo } from "react";
import clsx from "clsx";
import MediaPreview from "./MediaPreview";
import type { MediaItem } from "./MediaPreview";
import ExecutionStatus from "./ExecutionStatus";

import { getConfig } from "../../lib/api";

const VIDEO_EXTS = /\.(mp4|mov|webm|avi|mkv)$/i;
const IMAGE_EXTS = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i;
const AUDIO_EXTS = /\.(mp3|wav|ogg|aac|flac|m4a)$/i;

// Matches URLs ending with known media extensions
const URL_PATTERN = /https?:\/\/[^\s)`']+\.(mp4|mov|webm|avi|mkv|png|jpg|jpeg|gif|webp|svg|bmp|mp3|wav|ogg|aac|flac|m4a|pdf|md|py|js|ts|json|csv|txt|doc|docx|xlsx)(?:\?[^\s)]*)?/gi;

// Matches absolute file paths with media extensions (Unix paths)
const FILE_PATH_PATTERN = /(?:\/[\w.\-]+)+\.(mp4|mov|webm|avi|mkv|png|jpg|jpeg|gif|webp|svg|bmp|mp3|wav|ogg|aac|flac|m4a|pdf|md|py|js|ts|json|csv|txt|doc|docx|xlsx)/gi;

// Matches ~ paths like ~/.superboo/workspace/output/file.mp4
const TILDE_PATH_PATTERN = /~(?:\/[\w.\-]+)+\.(mp4|mov|webm|avi|mkv|png|jpg|jpeg|gif|webp|svg|bmp|mp3|wav|ogg|aac|flac|m4a|pdf|md|py|js|ts|json|csv|txt|doc|docx|xlsx)/gi;

// Matches [generating:type] markers
const GENERATING_PATTERN = /\[generating:(video|image|document|audio)(?::(\d+))?\]/gi;

// Matches [media:type:url] or [media:type:url:name] markers
const MEDIA_PATTERN = /\[media:(video|image|document|audio):([^\]:]+)(?::([^\]]+))?\]/gi;

function detectMediaType(path: string): MediaItem["type"] {
  if (VIDEO_EXTS.test(path)) return "video";
  if (IMAGE_EXTS.test(path)) return "image";
  if (AUDIO_EXTS.test(path)) return "audio";
  return "document";
}

/** Convert a VM file path to a bridge URL */
function pathToBridgeUrl(filePath: string): string {
  const cfg = getConfig();
  let abs = filePath;
  // Expand ~ to /home/anubhav
  if (abs.startsWith("~")) abs = abs.replace("~", "/home/anubhav");
  // Map container paths to host paths
  if (abs.startsWith("/home/node/.openclaw"))
    abs = abs.replace("/home/node/.openclaw", "/home/anubhav/.openclaw");
  if (abs.startsWith("/home/node/"))
    abs = abs.replace("/home/node/", "/home/anubhav/");
  return `${cfg.url}/v1/files${abs}?token=${encodeURIComponent(cfg.token)}`;
}

function extractMedia(content: string, _streaming?: boolean): { items: MediaItem[]; cleanContent: string } {
  const items: MediaItem[] = [];
  let cleanContent = content;

  // Extract [generating:type] markers
  let match: RegExpExecArray | null;
  const genRegex = new RegExp(GENERATING_PATTERN.source, "gi");
  while ((match = genRegex.exec(content)) !== null) {
    items.push({
      type: match[1] as MediaItem["type"],
      status: "generating",
      progress: match[2] ? parseInt(match[2], 10) : undefined,
    });
  }
  cleanContent = cleanContent.replace(GENERATING_PATTERN, "");

  // Extract [media:type:url:name] markers
  const mediaRegex = new RegExp(MEDIA_PATTERN.source, "gi");
  while ((match = mediaRegex.exec(content)) !== null) {
    items.push({
      type: match[1] as MediaItem["type"],
      url: match[2],
      name: match[3],
      status: "ready",
    });
  }
  cleanContent = cleanContent.replace(MEDIA_PATTERN, "");

  // Extract raw URLs with media extensions
  const urlRegex = new RegExp(URL_PATTERN.source, "gi");
  const existingUrls = new Set(items.filter((i) => i.url).map((i) => i.url));
  while ((match = urlRegex.exec(content)) !== null) {
    const url = match[0];
    if (!existingUrls.has(url)) {
      const type = detectMediaType(url);
      const name = url.split("/").pop()?.split("?")[0];
      items.push({ type, url, name, status: "ready" });
      existingUrls.add(url);
    }
  }

  // Extract absolute file paths (e.g. /home/anubhav/.superboo/workspace/output/video.mp4)
  const seenPaths = new Set<string>();
  for (const pattern of [FILE_PATH_PATTERN, TILDE_PATH_PATTERN]) {
    const pathRegex = new RegExp(pattern.source, "gi");
    while ((match = pathRegex.exec(content)) !== null) {
      const filePath = match[0];
      if (seenPaths.has(filePath)) continue;
      // Skip if this path is already part of an HTTP URL we extracted
      if ([...existingUrls].some((u) => u?.includes(filePath))) continue;
      seenPaths.add(filePath);
      const type = detectMediaType(filePath);
      const name = filePath.split("/").pop() || filePath;
      const url = pathToBridgeUrl(filePath);
      items.push({ type, url, name, status: "ready" });
      existingUrls.add(url);
    }
  }

  // Strip system/metadata markers from displayed text
  cleanContent = cleanContent
    .replace(/\[system:[^\]]*\]/gi, "")
    .replace(/\[skills:[^\]]*\]/gi, "")
    .replace(/\[attachments:[^\]]*\]/gi, "")
    .replace(/\[model:[^\]]*\]/gi, "")
    .replace(/\[agent:[^\]]*\]/gi, "")
    .replace(/\[context:[^\]]*\]/gi, "")
    .replace(/\[session:[^\]]*\]/gi, "")
    .trim();

  return { items, cleanContent };
}

function MiniGhost() {
  return (
    <svg width="28" height="28" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#ghostGradMsg)"
      />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <defs>
        <radialGradient id="ghostGradMsg" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function Message({ msg }: { msg: MessageType }) {
  const [toolOpen, setToolOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isUser = msg.role === "user";
  const isTool = msg.role === "tool";

  // Extract media from content and from explicit media field
  const { items: contentMedia, cleanContent } = useMemo(
    () => extractMedia(msg.content, msg.streaming),
    [msg.content, msg.streaming]
  );

  const explicitMedia: MediaItem[] = useMemo(
    () =>
      (msg.media || []).map((m) => ({
        type: m.type,
        url: m.url,
        name: m.name,
        status: m.status,
        progress: m.progress,
      })),
    [msg.media]
  );

  const allMedia = useMemo(() => {
    const seen = new Set<string>();
    const result: MediaItem[] = [];
    for (const item of [...explicitMedia, ...contentMedia]) {
      const key = item.url || `${item.type}-${item.status}-${item.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  }, [explicitMedia, contentMedia]);

  // Detect if content has structured elements (headings, lists, code blocks)
  const hasStructuredContent = cleanContent ? /^#{1,3}\s|^\-\s|^\d+\.\s|```/m.test(cleanContent) : false;

  // User messages — right-aligned bubble
  if (isUser) {
    return (
      <div className="msg-slide-up px-4 md:px-8 py-3 md:py-4">
        <div className="max-w-full md:max-w-3xl mx-auto flex justify-end gap-3">
          <div className="max-w-[85%] md:max-w-[70%]">
            <div className="rounded-2xl rounded-tr-md px-4 py-3 text-[14px] text-fg leading-relaxed" style={{background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)'}}>
              {msg.content}
            </div>
          </div>
          <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white mt-0.5" style={{background: 'linear-gradient(135deg, #9370ff, #EC4899)'}}>
            A
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-slide-up group px-4 md:px-8 py-3 md:py-4">
      <div className="max-w-full md:max-w-3xl mx-auto flex gap-3 md:gap-3.5">
        {/* Ghost avatar */}
        <div className="flex-shrink-0 mt-0.5">
          {isTool ? (
            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Wrench size={12} className="text-amber-400" />
            </div>
          ) : (
            <div className="drop-shadow-[0_0_10px_rgba(147,112,255,0.5)]">
              <MiniGhost />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Tool call block */}
          {msg.toolCall && (
            <div className="mb-3 rounded-2xl overflow-hidden" style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <button
                onClick={() => setToolOpen(!toolOpen)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-bg-surface transition-colors"
              >
                <span className="text-base">&#128295;</span>
                <span className="text-[12px] font-mono text-fg font-medium">
                  {msg.toolCall.name}
                </span>
                <span className="text-[11px] text-fg-dim font-mono truncate flex-1 text-left">
                  {msg.toolCall.input}
                </span>
                <ChevronDown
                  size={12}
                  className={clsx(
                    "text-fg-dim transition-transform",
                    toolOpen && "rotate-180"
                  )}
                />
              </button>
              {toolOpen && msg.toolCall.output && (
                <div className="border-t border-border px-4 py-3 bg-bg font-mono text-[11px] text-fg-muted whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {msg.toolCall.output}
                </div>
              )}
            </div>
          )}

          {/* Media previews */}
          {allMedia.length > 0 && (
            <div className="flex flex-col gap-3 mb-3">
              {allMedia.map((item, i) => (
                <MediaPreview key={item.url || `media-${i}`} item={item} />
              ))}
            </div>
          )}

          {/* Execution steps (shown while loading) */}
          {msg.execSteps && msg.execSteps.length > 0 && (
            <div className="mb-2">
              <ExecutionStatus steps={msg.execSteps} />
            </div>
          )}

          {/* Content — card-style for bot messages */}
          {cleanContent && (
            <div
              className={clsx(
                "relative",
                // Sparkpage-style card for bot messages with structured content
                hasStructuredContent && !isTool
                  ? "rounded-2xl p-5 md:p-6"
                  : "prose-msg"
              )}
              style={hasStructuredContent && !isTool ? {background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)'} : undefined}
            >
              {/* Colored top border for structured cards */}
              {hasStructuredContent && !isTool && (
                <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full" style={{background: 'linear-gradient(to right, #9370ff, #EC4899)'}} />
              )}
              <div className={hasStructuredContent && !isTool ? "prose-msg" : ""}>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {cleanContent}
                </ReactMarkdown>
              </div>
              {/* Copy pill on hover */}
              {!msg.streaming && (
                <button
                  onClick={copy}
                  className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-elevated border border-border text-fg-dim hover:text-fg hover:border-accent/30 text-[10px] transition-all shadow-card"
                  title="Copy"
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
