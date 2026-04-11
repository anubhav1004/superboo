import { useState } from "react";
import { X, Download, Maximize2, Minimize2, FileText, Presentation, Table, Image as ImageIcon, Film } from "lucide-react";
import { getConfig } from "../../lib/api";

interface Props {
  filePath: string | null;
  onClose: () => void;
}

function getFileType(path: string): "slides" | "document" | "spreadsheet" | "image" | "video" | "unknown" {
  const ext = path.split(".").pop()?.toLowerCase() || "";
  if (["pptx", "ppt"].includes(ext)) return "slides";
  if (["docx", "doc", "pdf", "md", "txt"].includes(ext)) return "document";
  if (["xlsx", "xls", "csv"].includes(ext)) return "spreadsheet";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  return "unknown";
}

function getFileUrl(path: string): string {
  const cfg = getConfig();
  let abs = path;
  if (abs.startsWith("~")) abs = abs.replace("~", "/home/anubhav");
  if (abs.startsWith("/home/node/.openclaw")) abs = abs.replace("/home/node/.openclaw", "/home/anubhav/.openclaw");
  if (abs.startsWith("/home/node/")) abs = abs.replace("/home/node/", "/home/anubhav/");
  return `${cfg.url}/v1/files${abs}?token=${encodeURIComponent(cfg.token)}`;
}

const TYPE_ICONS = {
  slides: Presentation,
  document: FileText,
  spreadsheet: Table,
  image: ImageIcon,
  video: Film,
  unknown: FileText,
};

const TYPE_LABELS = {
  slides: "Presentation",
  document: "Document",
  spreadsheet: "Spreadsheet",
  image: "Image",
  video: "Video",
  unknown: "File",
};

export default function CanvasPreview({ filePath, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!filePath) return null;

  const fileType = getFileType(filePath);
  const fileUrl = getFileUrl(filePath);
  const fileName = filePath.split("/").pop() || "file";
  const Icon = TYPE_ICONS[fileType];

  return (
    <div className={`${expanded ? "fixed inset-0 z-50" : "w-[420px] flex-shrink-0 h-full"} flex flex-col border-l border-[rgba(255,255,255,0.08)]`}
      style={{ background: "rgba(12,1,24,0.95)", backdropFilter: "blur(24px)" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={14} className="text-[#9370ff] flex-shrink-0" />
          <span className="text-[13px] text-fg font-medium truncate">{fileName}</span>
          <span className="text-[10px] text-fg-dim px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)]">{TYPE_LABELS[fileType]}</span>
        </div>
        <div className="flex items-center gap-1">
          <a href={fileUrl} download={fileName}
            className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-fg-dim hover:text-fg transition-all"
            title="Download">
            <Download size={14} />
          </a>
          <button onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-fg-dim hover:text-fg transition-all"
            title={expanded ? "Minimize" : "Expand"}>
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-fg-dim hover:text-fg transition-all"
            title="Close">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        {fileType === "image" && (
          <img src={fileUrl} alt={fileName} className="max-w-full max-h-full rounded-xl object-contain" />
        )}

        {fileType === "video" && (
          <video src={fileUrl} controls className="max-w-full max-h-full rounded-xl" style={{ colorScheme: "dark" }} />
        )}

        {(fileType === "slides" || fileType === "document" || fileType === "spreadsheet") && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-6">
            {/* Visual mock of the file */}
            <div className="relative">
              <div className="w-48 h-64 rounded-xl border border-[rgba(255,255,255,0.1)] overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(147,112,255,0.1), rgba(236,72,153,0.05))" }}>
                {/* Mock content lines */}
                <div className="p-4 space-y-3">
                  <div className="h-3 rounded-full bg-[rgba(255,255,255,0.15)] w-3/4" />
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] w-full" />
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] w-5/6" />
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] w-4/6" />
                  <div className="h-6" />
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] w-full" />
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] w-3/4" />
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.08)] w-5/6" />
                </div>
                {/* File type badge */}
                <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: "rgba(147,112,255,0.2)", color: "#9370ff" }}>
                  .{filePath.split(".").pop()}
                </div>
              </div>
              {/* Glow */}
              <div className="absolute inset-0 -m-4 rounded-2xl opacity-30"
                style={{ background: "radial-gradient(circle, rgba(147,112,255,0.3), transparent 70%)", filter: "blur(20px)" }} />
            </div>

            <div className="text-center">
              <div className="text-[14px] font-medium text-fg mb-1">{fileName}</div>
              <div className="text-[12px] text-fg-dim mb-4">Your {TYPE_LABELS[fileType].toLowerCase()} is ready</div>
              <a href={fileUrl} download={fileName}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] text-white font-medium transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)", boxShadow: "0 0 20px -5px rgba(147,112,255,0.4)" }}>
                <Download size={14} />
                Download {TYPE_LABELS[fileType]}
              </a>
            </div>
          </div>
        )}

        {fileType === "unknown" && (
          <div className="text-center">
            <FileText size={48} className="text-fg-dim mx-auto mb-4" />
            <div className="text-[14px] text-fg mb-1">{fileName}</div>
            <a href={fileUrl} download={fileName}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] text-white font-medium mt-4"
              style={{ background: "linear-gradient(135deg, #9370ff, #EC4899)" }}>
              <Download size={14} /> Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
