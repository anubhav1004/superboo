import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Search, Video, Image, Share2, Mic, Layout, PenTool, Wand2, Smile, Presentation, FileText, BookOpen, Mail, Film, Headphones, Music, Scroll, BarChart2, Briefcase, TrendingUp, Search as SearchIcon, Type, Heart, GraduationCap, HelpCircle, Globe, Bookmark, Utensils, Dumbbell, MapPin, Gift, Wallet, UserCheck, Feather } from "lucide-react";
import { SKILLS, SKILL_CATEGORIES } from "../../data/skills";
import type { Skill } from "../../types";
import clsx from "clsx";

interface Props {
  onClose: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "video": Video, "image": Image, "share-2": Share2, "mic": Mic,
  "layout": Layout, "pen-tool": PenTool, "wand-2": Wand2, "smile": Smile,
  "presentation": Presentation, "file-text": FileText, "book-open": BookOpen,
  "mail": Mail, "film": Film, "headphones": Headphones, "music": Music,
  "scroll": Scroll, "bar-chart-2": BarChart2, "briefcase": Briefcase,
  "trending-up": TrendingUp, "search": SearchIcon,
  "type": Type, "heart": Heart, "graduation-cap": GraduationCap,
  "help-circle": HelpCircle, "globe": Globe, "bookmark": Bookmark,
  "utensils": Utensils, "dumbbell": Dumbbell, "map-pin": MapPin,
  "gift": Gift, "wallet": Wallet, "user-check": UserCheck,
  "linkedin": UserCheck, "feather": Feather,
};

const CATEGORY_COLORS: Record<string, string> = {
  "Content Creation": "#EC4899",
  "Design & Visual": "#3B82F6",
  "Presentations & Docs": "#22C55E",
  "Video & Audio": "#F97316",
  "Business & Research": "#EAB308",
};

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || "#7c5cff";
}

export default function SkillsPanel({ onClose }: Props) {
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = SKILLS.filter((s) => {
    const q = query.toLowerCase();
    const matchQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q);
    const matchCat = category === "All" || s.category === category;
    return matchQuery && matchCat;
  });

  const handleTryIt = (skill: Skill) => {
    onClose();
    nav("/chat", { state: { prefill: skill.examplePrompt } });
  };

  return (
    <div
      className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-0 md:p-8 fade-in-fast"
      onClick={onClose}
    >
      <div
        className="border-0 md:border rounded-none md:rounded-2xl w-full max-w-3xl h-full md:h-[85vh] flex flex-col overflow-hidden shadow-modal modal-enter"
        style={{background: 'rgba(19,13,34,0.95)', backdropFilter: 'blur(24px)', borderColor: 'rgba(255,255,255,0.08)'}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-fg">Create something</h2>
            <div className="text-[11px] text-fg-dim mt-0.5">
              {filtered.length} creation{filtered.length !== 1 ? "s" : ""} available
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        {/* Gradient header line */}
        <div className="h-[1px] mx-4 mb-3" style={{ background: 'linear-gradient(to right, transparent, rgba(147,112,255,0.3), transparent)' }} />

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative mb-3">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-dim pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creations..."
              className="w-full bg-bg-surface border border-border rounded-full pl-10 pr-4 py-2.5 text-xs text-fg placeholder:text-fg-dim focus:outline-none focus:border-accent/40 focus:shadow-[0_0_0_3px_rgba(147,112,255,0.1)] transition-all"
            />
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 flex-wrap">
            {["All", ...SKILL_CATEGORIES].map((c) => {
              const color = c === "All" ? "#7c5cff" : getCategoryColor(c);
              const isActive = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={clsx(
                    "text-[10px] px-3 py-1.5 rounded-full border transition-all hover:scale-105 active:scale-95 font-medium",
                    isActive
                      ? "text-white"
                      : "bg-bg-surface border-border text-fg-muted hover:text-fg hover:border-border-strong"
                  )}
                  style={isActive ? {
                    backgroundColor: `${color}20`,
                    borderColor: `${color}60`,
                    color: color,
                  } : undefined}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card grid */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((skill) => {
              const IconComp = ICON_MAP[skill.icon];
              const color = getCategoryColor(skill.category);
              return (
                <div
                  key={skill.id}
                  className="relative rounded-xl transition-all group overflow-hidden"
                  style={{background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)'}}
                >
                  {/* Left colored accent bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                    style={{ backgroundColor: color }}
                  />

                  <div className="pl-4 pr-3 py-3.5">
                    {/* Icon + trending badge */}
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${color}15` }}
                      >
                        {IconComp && <IconComp size={16} className="flex-shrink-0" />}
                      </div>
                      {skill.trending && (
                        <span className="text-[10px] leading-none" title="Trending">
                          {"🔥"}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="text-[14px] font-semibold text-fg mb-1 leading-tight">
                      {skill.name}
                    </h3>

                    {/* Description */}
                    <p className="text-[12px] text-fg-muted leading-relaxed line-clamp-2 mb-2">
                      {skill.description}
                    </p>

                    {/* Connector pill */}
                    {skill.connector && (
                      <div className="flex items-center gap-1 mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] text-fg-dim px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <span className="text-[11px]">{skill.connector.icon}</span>
                          {skill.connector.name}
                          {skill.connector.free && <span className="text-[#4ade80]">&middot; Free</span>}
                        </span>
                      </div>
                    )}

                    {/* Try it button */}
                    <button
                      onClick={() => handleTryIt(skill)}
                      className="text-[11px] font-medium transition-colors hover:underline"
                      style={{ background: `linear-gradient(135deg, ${color}, #C084FC)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      {"Try it \u2192"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="flex items-center justify-center py-16 text-fg-dim text-sm">
              No creations match your search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
