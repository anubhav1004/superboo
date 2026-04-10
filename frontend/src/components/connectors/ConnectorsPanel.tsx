import { useState } from "react";
import { X, Search, AlertCircle, Settings, Plug } from "lucide-react";
import { CONNECTORS, CONNECTOR_CATEGORIES } from "../../data/connectors";
import clsx from "clsx";

interface Props {
  onClose: () => void;
}

export default function ConnectorsPanel({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = CONNECTORS.filter((c) => {
    const q = query.toLowerCase();
    const matchQ =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    const matchC = category === "All" || c.category === category;
    return matchQ && matchC;
  });

  const connectedCount = CONNECTORS.filter((c) => c.status === "connected").length;

  const statusBadge = (status: string) => {
    if (status === "connected")
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#4ade80] bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] green-pulse shadow-[0_0_6px_2px_rgba(74,222,128,0.4)]" />
          Connected
        </span>
      );
    if (status === "configured")
      return (
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#fbbf24] bg-[#fbbf24]/10 border border-[#fbbf24]/20 px-2 py-0.5 rounded-full">
          <Settings size={9} />
          Configured
        </span>
      );
    return (
      <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#f87171] bg-[#f87171]/10 border border-[#f87171]/20 px-2 py-0.5 rounded-full">
        <AlertCircle size={9} />
        Offline
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-0 md:p-8 fade-in-fast"
      onClick={onClose}
    >
      <div
        className="bg-bg-elevated border-0 md:border border-border rounded-none md:rounded-2xl w-full max-w-5xl h-full md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden shadow-modal modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 md:px-6 pt-5 pb-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent-hover">
              <Plug size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-fg tracking-tight">
                Connectors
              </h2>
              <p className="text-[11px] text-fg-muted mt-0.5">
                <span className="text-[#4ade80] font-medium">{connectedCount}</span> of{" "}
                {CONNECTORS.length} connected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-4 md:px-6 py-4 border-b border-border">
          <div className="relative mb-3">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-dim pointer-events-none"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search connectors..."
              className="w-full bg-bg-surface border border-border rounded-full pl-9 pr-3 py-2.5 text-xs text-fg placeholder:text-fg-dim focus:outline-none focus:border-accent/40 focus:shadow-[0_0_0_3px_rgba(147,112,255,0.1)] transition-all"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["All", ...CONNECTOR_CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={clsx(
                  "text-[10px] px-3 py-1.5 rounded-full border transition-all capitalize hover:scale-105 active:scale-95",
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

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className={clsx(
                "group bg-bg-surface border rounded-2xl p-4 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover-gradient-border",
                c.status === "connected"
                  ? "border-border hover:shadow-[0_0_20px_-6px_rgba(147,112,255,0.2)]"
                  : "border-border opacity-80 hover:opacity-100"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={clsx(
                      "w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0",
                      c.status === "connected"
                        ? "bg-gradient-to-br from-accent/30 to-accent/10 text-accent-hover border border-accent/30"
                        : "bg-bg-elevated text-fg-dim border border-border"
                    )}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <span className="text-[13px] font-semibold text-fg truncate">
                    {c.name}
                  </span>
                </div>
                {statusBadge(c.status)}
              </div>
              <p className="text-[11px] text-fg-muted leading-relaxed line-clamp-2 mb-3">
                {c.description}
              </p>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-fg-dim capitalize px-2 py-0.5 rounded-full bg-bg border border-border">{c.category}</span>
                {c.credentials && (
                  <span className="font-mono text-fg-dim bg-bg px-2 py-0.5 rounded-full border border-border/60 truncate max-w-[140px]">
                    {c.credentials}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
