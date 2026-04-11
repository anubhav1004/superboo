import { useState } from "react";
import { X } from "lucide-react";
import { useBotStore } from "../../store/bots";
import { CATEGORY_COLORS } from "../../data/bots";
import type { Bot } from "../../data/bots";

const EMOJI_OPTIONS = [
  "\uD83E\uDD16", "\uD83D\uDC7B", "\uD83D\uDE80", "\uD83C\uDF1F", "\uD83D\uDD25",
  "\uD83C\uDFA8", "\uD83C\uDFAF", "\uD83D\uDCDA", "\uD83D\uDCA1", "\uD83D\uDCAC",
  "\uD83C\uDFB5", "\uD83C\uDF0D", "\uD83D\uDC8E", "\u26A1", "\uD83C\uDF08",
  "\uD83E\uDDE0", "\uD83D\uDD2E", "\uD83C\uDFAE", "\uD83D\uDCF8", "\u2728",
];

const CATEGORIES = ["Productivity", "Creative", "Learning", "Lifestyle", "Business", "Fun"];

interface Props {
  onClose: () => void;
}

export default function CreateBotModal({ onClose }: Props) {
  const { addCustomBot } = useBotStore();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("\uD83E\uDD16");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [category, setCategory] = useState("Productivity");

  const canCreate = name.trim() && description.trim() && systemPrompt.trim();

  const handleCreate = () => {
    if (!canCreate) return;
    const bot: Bot = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      emoji,
      category,
      color: CATEGORY_COLORS[category] || "#8B5CF6",
      systemPrompt: systemPrompt.trim(),
      skills: [],
      greeting: `Hey! I'm ${name.trim()}. How can I help you?`,
      online: true,
    };
    addCustomBot(bot);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #1a0e2e, #0c0118)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2
            className="text-[18px] font-bold"
            style={{
              background: "linear-gradient(135deg, #C084FC, #EC4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Create your bot
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all bg-transparent border-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-[12px] text-white/50 font-medium mb-1.5">
              Bot name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Study Buddy"
              maxLength={30}
              className="w-full rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Emoji picker */}
          <div>
            <label className="block text-[12px] text-white/50 font-medium mb-1.5">
              Pick an emoji
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[20px] transition-all hover:scale-110 cursor-pointer border-none"
                  style={{
                    background:
                      emoji === e
                        ? "rgba(147,112,255,0.3)"
                        : "rgba(255,255,255,0.04)",
                    border:
                      emoji === e
                        ? "2px solid rgba(147,112,255,0.6)"
                        : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] text-white/50 font-medium mb-1.5">
              Short description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this bot do?"
              maxLength={100}
              className="w-full rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* System prompt */}
          <div>
            <label className="block text-[12px] text-white/50 font-medium mb-1.5">
              How should Boo behave?
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="e.g. You are a friendly cooking assistant who helps plan meals and share recipes..."
              rows={3}
              className="w-full rounded-xl px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all resize-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[12px] text-white/50 font-medium mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer border-none"
                  style={{
                    background:
                      category === cat
                        ? CATEGORY_COLORS[cat]
                        : "rgba(255,255,255,0.04)",
                    color:
                      category === cat ? "white" : "rgba(255,255,255,0.5)",
                    border:
                      category === cat
                        ? "none"
                        : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-[13px] text-white/50 hover:text-white/80 transition-all bg-transparent border border-white/10 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="px-6 py-2.5 rounded-full text-[13px] text-white font-semibold transition-all hover:opacity-90 disabled:opacity-30 border-none cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #9370ff, #EC4899)",
            }}
          >
            Create Bot
          </button>
        </div>
      </div>
    </div>
  );
}
