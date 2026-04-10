import { useRef, useState, useEffect } from "react";
import {
  Plus,
  Hash,
  Mic,
  ArrowUp,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Code,
  Sparkles,
} from "lucide-react";
import { SKILLS } from "../../data/skills";
import type { Skill } from "../../types";
import clsx from "clsx";

interface Props {
  onSend: (text: string, skillTags: string[], files: File[]) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [showSkillPicker, setShowSkillPicker] = useState(false);
  const [skillQuery, setSkillQuery] = useState("");
  const [recording, setRecording] = useState(false);
  const [focused, setFocused] = useState(false);
  const [sendBounce, setSendBounce] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const match = text.match(/#(\w*)$/);
    if (match) {
      setShowSkillPicker(true);
      setSkillQuery(match[1]);
    } else {
      setShowSkillPicker(false);
    }
  }, [text]);

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
    onSend(trimmed, skillTags, files);
    setText("");
    setSkillTags([]);
    setFiles([]);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addSkill = (skill: Skill) => {
    if (!skillTags.includes(skill.id)) {
      setSkillTags((prev) => [...prev, skill.id]);
    }
    setText((prev) => prev.replace(/#\w*$/, ""));
    setShowSkillPicker(false);
    textareaRef.current?.focus();
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

  const filteredSkills = SKILLS.filter((s) =>
    s.name.toLowerCase().includes(skillQuery.toLowerCase())
  ).slice(0, 6);

  const fileIcon = (f: File) => {
    if (f.type.startsWith("image/")) return <ImageIcon size={12} />;
    if (f.type.startsWith("video/")) return <Video size={12} />;
    if (f.name.match(/\.(js|ts|py|go|rs|tsx|jsx)$/)) return <Code size={12} />;
    return <FileText size={12} />;
  };

  const canSend = !disabled && (text.trim() || files.length > 0);

  return (
    <div className="px-4 md:px-8 pb-4 md:pb-6 pt-2">
      <div className="max-w-full md:max-w-3xl mx-auto">
        {/* Skill tags */}
        {skillTags.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap px-1">
            {skillTags.map((id) => {
              const skill = SKILLS.find((s) => s.id === id);
              return (
                <span
                  key={id}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-accent/15 text-accent-hover border border-accent/30 fade-in-fast"
                >
                  <Sparkles size={10} />
                  {skill?.name ?? id}
                  <button
                    onClick={() =>
                      setSkillTags((prev) => prev.filter((x) => x !== id))
                    }
                    className="hover:text-white transition-colors ml-0.5"
                  >
                    <X size={11} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Files */}
        {files.length > 0 && (
          <div className="flex gap-1.5 mb-2 flex-wrap px-1">
            {files.map((f, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-bg-surface border border-border text-fg-muted fade-in-fast"
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

        {/* Input container */}
        <div
          className={clsx(
            "relative bg-bg-elevated border rounded-2xl transition-all duration-200 ambient-glow noise-bg",
            focused
              ? "border-accent/40 shadow-[0_0_24px_-4px_rgba(147,112,255,0.2)]"
              : "border-border hover:border-border-strong",
            disabled && "opacity-60"
          )}
        >
          {/* Skill picker dropdown */}
          {showSkillPicker && filteredSkills.length > 0 && (
            <div className="absolute bottom-full mb-2 left-0 right-0 glass border border-border rounded-2xl shadow-modal overflow-hidden scale-in">
              <div className="px-4 py-2.5 text-[11px] text-fg-dim font-medium uppercase tracking-wider border-b border-border flex items-center gap-2">
                <Sparkles size={11} className="text-accent" />
                Skills
              </div>
              {filteredSkills.map((s) => (
                <button
                  key={s.id}
                  onClick={() => addSkill(s)}
                  className="w-full text-left px-4 py-3 hover:bg-bg-hover transition-all border-b border-border/40 last:border-b-0 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-fg font-medium">{s.name}</span>
                    <span className="text-[10px] text-fg-dim px-2 py-0.5 rounded-full bg-bg-surface border border-border">{s.category}</span>
                  </div>
                  <div className="text-[11px] text-fg-dim truncate mt-0.5">
                    {s.description}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Gradient focus line */}
          <div className={clsx(
            "h-[1px] mx-4 transition-opacity duration-300",
            focused ? "opacity-100" : "opacity-0"
          )} style={{background: 'linear-gradient(to right, transparent, rgba(147,112,255,0.4), transparent)'}} />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask Boo anything..."
            rows={1}
            className="w-full bg-transparent text-[14px] text-fg placeholder:text-fg-dim px-5 pt-3 pb-1 resize-none focus:outline-none leading-relaxed relative z-[1]"
            disabled={disabled}
          />

          <div className="flex items-center gap-1.5 px-3 pb-3 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-110 active:scale-95"
              title="Attach file"
            >
              <Plus size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <button
              onClick={() => {
                setText(
                  (prev) => prev + (prev.endsWith(" ") || !prev ? "#" : " #")
                );
                textareaRef.current?.focus();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-bg-surface text-fg-muted hover:text-accent transition-all hover:scale-110 active:scale-95"
              title="Add skill"
            >
              <Hash size={15} />
            </button>
            <button
              onClick={toggleRecording}
              className={clsx(
                "w-8 h-8 flex items-center justify-center rounded-full transition-all relative",
                recording
                  ? "bg-red-500/15 text-red-400 pulse-ring"
                  : "hover:bg-bg-surface text-fg-muted hover:text-fg hover:scale-110 active:scale-95"
              )}
              title="Voice input"
            >
              <Mic size={15} className={recording ? "pulse-dot" : ""} />
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={clsx(
                "w-9 h-9 flex items-center justify-center rounded-full transition-all",
                canSend
                  ? "bg-gradient-to-br from-[#9370ff] to-[#C084FC] text-white shadow-[0_0_16px_-2px_rgba(147,112,255,0.4)] hover:shadow-[0_0_24px_-2px_rgba(147,112,255,0.6)] hover:scale-110 active:scale-90"
                  : "bg-bg-surface text-fg-dim cursor-not-allowed opacity-50",
                sendBounce && "bounce-send"
              )}
              title="Send"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
