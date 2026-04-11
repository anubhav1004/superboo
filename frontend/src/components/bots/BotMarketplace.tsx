import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Plus } from "lucide-react";
import { BOTS, BOT_CATEGORIES, CATEGORY_COLORS } from "../../data/bots";
import { useBotStore } from "../../store/bots";
import CreateBotModal from "./CreateBotModal";

function Ghost({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 128 128">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#gBotMkt)"
      />
      <ellipse cx="26" cy="70" rx="10" ry="14" fill="url(#gBotMkt)" />
      <ellipse cx="102" cy="70" rx="10" ry="14" fill="url(#gBotMkt)" />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="64" cy="76" rx="8" ry="5" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <ellipse cx="64" cy="40" rx="30" ry="18" fill="white" opacity="0.25" />
      <defs>
        <radialGradient id="gBotMkt" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function BotMarketplace() {
  const navigate = useNavigate();
  const { customBots } = useBotStore();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const allBots = useMemo(() => [...BOTS, ...customBots], [customBots]);

  const filtered = useMemo(() => {
    return allBots.filter((b) => {
      const matchesQuery =
        !query ||
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.description.toLowerCase().includes(query.toLowerCase());
      const matchesCat =
        activeCategory === "All" || b.category === activeCategory;
      return matchesQuery && matchesCat;
    });
  }, [allBots, query, activeCategory]);

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#0c0118" }}
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] text-white/40 hover:text-white/70 transition-colors mb-6 bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Ghost size={36} />
          <h1
            className="text-[28px] md:text-[36px] font-extrabold"
            style={{
              background: "linear-gradient(135deg, #C084FC, #EC4899, #9370ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Boo 24x7
          </h1>
        </div>
        <p className="text-[14px] text-white/40 mb-6">
          Your AI bots, always on
        </p>

        {/* Search */}
        <div className="relative max-w-md mb-5">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bots..."
            className="w-full rounded-full pl-11 pr-4 py-3 text-[14px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
            }}
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BOT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all cursor-pointer border-none"
              style={{
                background:
                  activeCategory === cat
                    ? cat === "All"
                      ? "linear-gradient(135deg, #9370ff, #EC4899)"
                      : CATEGORY_COLORS[cat] || "#9370ff"
                    : "rgba(255,255,255,0.04)",
                color: activeCategory === cat ? "white" : "rgba(255,255,255,0.5)",
                border:
                  activeCategory === cat
                    ? "none"
                    : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bot Grid */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((bot) => (
            <button
              key={bot.id}
              onClick={() => navigate(`/bots/${bot.id}`)}
              className="group relative text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Accent bar */}
              <div
                className="h-1 w-full"
                style={{
                  background: `linear-gradient(90deg, ${bot.color}, ${bot.color}88)`,
                }}
              />

              <div className="p-4">
                {/* Emoji */}
                <div className="text-[36px] mb-3">{bot.emoji}</div>

                {/* Name + badges */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[14px] font-bold text-white truncate">
                    {bot.name}
                  </span>
                  {bot.online && (
                    <span className="w-2 h-2 rounded-full bg-[#4ade80] flex-shrink-0" />
                  )}
                </div>

                {/* Description */}
                <p className="text-[12px] text-white/40 leading-relaxed line-clamp-2 mb-3">
                  {bot.description}
                </p>

                {/* Bottom row */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: `${bot.color}20`,
                      color: bot.color,
                    }}
                  >
                    {bot.category}
                  </span>
                  {bot.popular && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                      Popular
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Create your own bot card */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="group relative text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(147,112,255,0.3)",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #9370ff, #EC4899)",
              }}
            >
              <Plus size={24} className="text-white" />
            </div>
            <span
              className="text-[14px] font-bold"
              style={{
                background:
                  "linear-gradient(135deg, #C084FC, #EC4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Create your own bot
            </span>
            <span className="text-[12px] text-white/30 mt-1">
              Build a custom AI bot
            </span>
          </button>
        </div>
      </div>

      {showCreateModal && (
        <CreateBotModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
