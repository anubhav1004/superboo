import { useState, useRef } from "react";
import {
  FileText,
  Music,
  Download,
  Play,
  Pause,
  X,
} from "lucide-react";
import clsx from "clsx";
import GeneratingBox from "./GeneratingBox";

export type MediaType = "video" | "image" | "document" | "audio";
export type MediaStatus = "generating" | "ready" | "error";

export interface MediaItem {
  type: MediaType;
  url?: string;
  name?: string;
  status: MediaStatus;
  progress?: number;
  size?: string;
}

interface MediaPreviewProps {
  item: MediaItem;
}

function formatFileName(name?: string): string {
  if (!name) return "Untitled";
  // Truncate long names
  if (name.length > 40) return name.slice(0, 37) + "...";
  return name;
}

function getExtension(name?: string, url?: string): string {
  const source = name || url || "";
  const match = source.match(/\.(\w+)(?:\?|$)/);
  return match ? match[1].toUpperCase() : "";
}

function VideoPlayer({ item }: { item: MediaItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative group/video rounded-2xl overflow-hidden bg-bg-elevated border border-border max-w-full sm:max-w-[300px] w-full shadow-card">
      {!loaded && <div className="absolute inset-0 shimmer aspect-video" />}
      <video
        ref={videoRef}
        src={item.url}
        controls
        preload="metadata"
        className={clsx(
          "w-full rounded-2xl transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoadedData={() => setLoaded(true)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        style={{ colorScheme: "dark" }}
      />
      {/* Play overlay when paused */}
      {loaded && !playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/video:opacity-100 transition-opacity"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center shadow-glow">
            <Play size={22} className="text-white ml-0.5" />
          </div>
        </button>
      )}
      <DownloadButton url={item.url} name={item.name} />
    </div>
  );
}

function ImagePreview({ item }: { item: MediaItem }) {
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <div className="relative group/img rounded-2xl overflow-hidden bg-bg-elevated border border-border max-w-full sm:max-w-[300px] w-full cursor-pointer shadow-card hover:shadow-glow transition-all hover:scale-[1.01]" onClick={() => setExpanded(true)}>
        {!loaded && <div className="shimmer aspect-square w-full" />}
        <img
          src={item.url}
          alt={item.name || "Image"}
          className={clsx(
            "w-full rounded-2xl transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
        />
        <DownloadButton url={item.url} name={item.name} />
      </div>

      {/* Lightbox */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8 fade-in-fast"
          onClick={() => setExpanded(false)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-bg-surface/80 flex items-center justify-center text-fg-muted hover:text-fg transition-all hover:scale-110"
            onClick={() => setExpanded(false)}
          >
            <X size={16} />
          </button>
          <img
            src={item.url}
            alt={item.name || "Image"}
            className="max-w-full max-h-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function DocumentCard({ item }: { item: MediaItem }) {
  const ext = getExtension(item.name, item.url);

  return (
    <div className="relative group/doc flex items-center gap-3 rounded-2xl bg-bg-elevated border border-border p-4 max-w-full sm:max-w-[300px] w-full hover:border-accent/30 hover:shadow-card transition-all hover:scale-[1.01]">
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
        <FileText size={18} className="text-accent-hover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-fg truncate font-medium">{formatFileName(item.name)}</div>
        <div className="text-[11px] text-fg-dim">
          {ext && <span className="px-1.5 py-0.5 rounded bg-bg-surface border border-border text-[9px] mr-1">{ext}</span>}
          {item.size && <span>{item.size}</span>}
        </div>
      </div>
      <DownloadButton url={item.url} name={item.name} />
    </div>
  );
}

function AudioPlayer({ item }: { item: MediaItem }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
    }
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    const pct = (audioRef.current.currentTime / (audioRef.current.duration || 1)) * 100;
    setProgress(pct);
  };

  return (
    <div className="relative group/audio flex items-center gap-3 rounded-2xl bg-bg-elevated border border-border p-4 max-w-full sm:max-w-[300px] w-full hover:border-accent/30 transition-all">
      <audio
        ref={audioRef}
        src={item.url}
        preload="metadata"
        onTimeUpdate={onTimeUpdate}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button
        onClick={togglePlay}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center hover:bg-accent/30 transition-all hover:scale-110 active:scale-95"
      >
        {playing ? (
          <Pause size={15} className="text-accent-hover" />
        ) : (
          <Play size={15} className="text-accent-hover ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] text-fg-muted truncate mb-2 font-medium">{formatFileName(item.name)}</div>
        <div className="h-1.5 rounded-full bg-bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <Music size={14} className="text-fg-dim flex-shrink-0" />
      <DownloadButton url={item.url} name={item.name} />
    </div>
  );
}

function DownloadButton({ url, name }: { url?: string; name?: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      download={name || true}
      className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg/80 backdrop-blur border border-border text-fg-dim hover:text-fg text-[10px] opacity-0 group-hover/video:opacity-100 group-hover/img:opacity-100 group-hover/doc:opacity-100 group-hover/audio:opacity-100 transition-all hover:bg-bg-surface hover:scale-105"
      onClick={(e) => e.stopPropagation()}
      title="Save"
    >
      <Download size={11} />
      Save
    </a>
  );
}

export default function MediaPreview({ item }: MediaPreviewProps) {
  if (item.status === "generating") {
    return <GeneratingBox type={item.type} progress={item.progress} label={item.name ? `Boo is creating ${item.name}` : undefined} />;
  }

  if (item.status === "error") {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-[#f87171]/10 border border-[#f87171]/20 px-4 py-3 text-[13px] text-[#f87171] max-w-sm">
        <X size={14} />
        <span>Failed to load {item.type}</span>
      </div>
    );
  }

  switch (item.type) {
    case "video":
      return <VideoPlayer item={item} />;
    case "image":
      return <ImagePreview item={item} />;
    case "document":
      return <DocumentCard item={item} />;
    case "audio":
      return <AudioPlayer item={item} />;
    default:
      return null;
  }
}
