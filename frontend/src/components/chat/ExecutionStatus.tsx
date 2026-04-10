import { Loader2, Check, Send, Brain, ArrowDownToLine, Sparkles } from "lucide-react";
import clsx from "clsx";

export type StepState = "pending" | "active" | "done";

export interface ExecStep {
  label: string;
  state: StepState;
  icon: "send" | "think" | "receive" | "render";
}

const ICONS = {
  send: Send,
  think: Brain,
  receive: ArrowDownToLine,
  render: Sparkles,
};

function MiniGhostBounce() {
  return (
    <svg width="20" height="20" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" className="ghost-float" style={{ animationDuration: "1.5s" }}>
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#ghostGradExec)"
      />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <defs>
        <radialGradient id="ghostGradExec" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function ExecutionStatus({ steps }: { steps: ExecStep[] }) {
  const doneCount = steps.filter((s) => s.state === "done").length;
  const allDone = doneCount === steps.length;
  const progressPct = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;

  return (
    <div className="rounded-2xl border border-accent/20 bg-bg-elevated p-4 max-w-sm fade-in animated-border">
      {/* Header with mini ghost */}
      <div className="flex items-center gap-2.5 mb-3">
        <MiniGhostBounce />
        <span className={clsx("text-[13px] font-medium", allDone ? "text-fg" : "text-shimmer")}>
          {allDone ? "All done!" : "Boo is working..."}
        </span>
      </div>

      {/* Steps checklist */}
      <div className="flex flex-col gap-2 ml-1">
        {steps.map((step, i) => {
          const Icon = ICONS[step.icon];
          return (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className={clsx(
                  "w-5 h-5 rounded-full flex items-center justify-center transition-all",
                  step.state === "done" && "bg-[#4ade80]/15 step-done-burst",
                  step.state === "active" && "bg-accent/15",
                  step.state === "pending" && "bg-bg-surface border border-border"
                )}
              >
                {step.state === "done" ? (
                  <Check size={10} className="text-[#4ade80]" />
                ) : step.state === "active" ? (
                  <Loader2 size={10} className="text-accent-hover animate-spin" />
                ) : (
                  <Icon size={9} className="text-fg-dim" />
                )}
              </div>
              <span
                className={clsx(
                  "text-[12px] transition-colors",
                  step.state === "done" && "text-fg-muted",
                  step.state === "active" && "text-fg font-medium",
                  step.state === "pending" && "text-fg-dim"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-bg-surface rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
