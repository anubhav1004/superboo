import { useState } from "react";
import { X, Download, Search } from "lucide-react";
import { SKILLS, SKILL_CATEGORIES } from "../../data/skills";
import type { Skill } from "../../types";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import clsx from "clsx";

interface Props {
  onClose: () => void;
}

function GhostSkillsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#ghostGradSkills)"
      />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <defs>
        <radialGradient id="ghostGradSkills" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  "Video": "bg-purple-500/15 text-purple-400 border-purple-500/20",
  "Social": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  "AI": "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  "Data": "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Dev": "bg-cyan-500/15 text-cyan-400 border-cyan-500/20",
};

function getCategoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] || "bg-accent/15 text-accent-hover border-accent/20";
}

export default function SkillsPanel({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selected, setSelected] = useState<Skill | null>(SKILLS[0]);

  const filtered = SKILLS.filter((s) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.tags.some((t) => t.includes(q));
    const matchCat = category === "All" || s.category === category;
    return matchQuery && matchCat;
  });

  const downloadMarkdown = (skill: Skill) => {
    const blob = new Blob([skill.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${skill.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-0 md:p-8 fade-in-fast"
      onClick={onClose}
    >
      <div
        className="bg-bg-elevated border-0 md:border border-border rounded-none md:rounded-2xl w-full max-w-6xl h-full md:h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-modal modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* List */}
        <div className={clsx(
          "border-b md:border-b-0 md:border-r border-border flex flex-col bg-bg",
          selected ? "hidden md:flex md:w-[360px]" : "flex-1 md:flex-none md:w-[360px]"
        )}>
          <div className="px-5 pt-5 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GhostSkillsIcon />
              <div>
                <h2 className="text-sm font-semibold text-fg">Boo's Skills</h2>
                <div className="text-[10px] text-fg-dim">
                  {filtered.length} of {SKILLS.length} available
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
            >
              <X size={15} />
            </button>
          </div>

          {/* Gradient header line */}
          <div className="h-[1px] mx-4 mb-3" style={{background: 'linear-gradient(to right, transparent, rgba(147,112,255,0.3), transparent)'}} />

          <div className="px-4 pb-3">
            <div className="relative mb-3">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim pointer-events-none"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search skills..."
                className="w-full bg-bg-surface border border-border rounded-full pl-9 pr-3 py-2.5 text-xs text-fg placeholder:text-fg-dim focus:outline-none focus:border-accent/40 focus:shadow-[0_0_0_3px_rgba(147,112,255,0.1)] transition-all"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {["All", ...SKILL_CATEGORIES].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={clsx(
                    "text-[10px] px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95",
                    category === c
                      ? "bg-accent/15 border-accent/40 text-accent-hover font-medium"
                      : "bg-bg-surface border-border text-fg-muted hover:text-fg hover:border-border-strong"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={clsx(
                  "w-full text-left p-3.5 rounded-xl transition-all mb-1.5 group hover:scale-[1.01] spotlight-hover",
                  selected?.id === s.id
                    ? "bg-accent/10 border border-accent/30 shadow-card"
                    : "border border-transparent hover:bg-bg-surface hover:border-border"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={clsx(
                      "text-[13px] font-medium transition-colors",
                      selected?.id === s.id ? "text-fg" : "text-fg-muted group-hover:text-fg"
                    )}
                  >
                    {s.name}
                  </span>
                  <span className={clsx("text-[9px] px-2 py-0.5 rounded-full border", getCategoryColor(s.category))}>
                    {s.category}
                  </span>
                </div>
                <div className="text-[11px] text-fg-dim line-clamp-2 leading-relaxed">
                  {s.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className={clsx(
          "flex-1 flex flex-col overflow-hidden bg-bg-elevated",
          !selected && "hidden md:flex"
        )}>
          {selected ? (
            <>
              <div className="px-4 md:px-8 pt-4 md:pt-6 pb-4 md:pb-5 border-b border-border">
                {/* Mobile back button */}
                <button
                  onClick={() => setSelected(null)}
                  className="md:hidden text-xs text-accent-hover mb-3 flex items-center gap-1"
                >
                  &larr; Back to skills
                </button>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <span className={clsx("text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full border mb-2 inline-block text-gradient", getCategoryColor(selected.category))}>
                      {selected.category}
                    </span>
                    <h1 className="text-xl font-semibold text-fg tracking-tight mb-1.5">
                      {selected.name}
                    </h1>
                    <p className="text-sm text-fg-muted leading-relaxed">
                      {selected.description}
                    </p>
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {selected.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] px-2.5 py-0.5 rounded-full bg-bg-surface border border-border text-fg-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => downloadMarkdown(selected)}
                    className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-full bg-gradient-to-r from-accent to-accent-hover hover:from-accent-hover hover:to-[#b39dff] text-white font-semibold transition-all shadow-card hover:shadow-glow hover:scale-105 active:scale-95 flex-shrink-0"
                  >
                    <Download size={12} />
                    Get skill
                  </button>
                </div>

                {(selected.model || selected.inputs || selected.outputs) && (
                  <div className="flex gap-6 mt-5 pt-5 border-t border-border">
                    {selected.model && (
                      <div>
                        <div className="text-[9px] text-fg-dim uppercase tracking-wider mb-1">
                          Model
                        </div>
                        <div className="text-[11px] font-mono text-fg">
                          {selected.model}
                        </div>
                      </div>
                    )}
                    {selected.inputs && (
                      <div>
                        <div className="text-[9px] text-fg-dim uppercase tracking-wider mb-1">
                          Inputs
                        </div>
                        <div className="text-[11px] text-fg">
                          {selected.inputs.join(", ")}
                        </div>
                      </div>
                    )}
                    {selected.outputs && (
                      <div>
                        <div className="text-[9px] text-fg-dim uppercase tracking-wider mb-1">
                          Outputs
                        </div>
                        <div className="text-[11px] text-fg">
                          {selected.outputs.join(", ")}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6">
                <div className="prose-msg max-w-none">
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                    {selected.markdown}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-fg-dim text-sm">
              Pick a skill to explore
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
