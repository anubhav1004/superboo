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
  const activeIdx = steps.findIndex((s) => s.state === "active");
  const activeLabel = activeIdx >= 0 ? steps[activeIdx].label : "";

  return (
    <div className="rounded-2xl border border-[#1f1f2a] bg-[#12121a] p-5 w-full fade-in">
      {/* Header with mini ghost */}
      <div className="flex items-center gap-2.5 mb-4">
        <MiniGhostBounce />
        <span className={clsx("text-[14px] font-medium", allDone ? "text-fg" : "text-shimmer")}>
          {allDone ? "All done!" : activeLabel || "Boo is creating..."}
        </span>
      </div>

      {/* Horizontal progress bar with labeled dots */}
      <div className="relative px-2">
        {/* Connection line */}
        <div className="absolute top-3 left-6 right-6 h-[2px] bg-[#1f1f2a] rounded-full" />
        {/* Progress fill */}
        <div
          className="absolute top-3 left-6 h-[2px] rounded-full bg-gradient-to-r from-[#9370ff] to-[#C084FC] transition-all duration-500 ease-out"
          style={{
            width: steps.length > 1
              ? `${(doneCount / (steps.length - 1)) * (100 - (12 / (steps.length)))}%`
              : "0%",
          }}
        />

        {/* Step dots */}
        <div className="relative flex justify-between">
          {steps.map((step, i) => {
            const Icon = ICONS[step.icon];
            return (
              <div key={i} className="flex flex-col items-center gap-2 z-10">
                {/* Dot */}
                <div
                  className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all border-2",
                    step.state === "done" && "bg-[#4ade80] border-[#4ade80] step-done-burst",
                    step.state === "active" && "bg-[#12121a] border-[#9370ff] shadow-[0_0_12px_-2px_rgba(147,112,255,0.5)]",
                    step.state === "pending" && "bg-[#12121a] border-[#1f1f2a]"
                  )}
                >
                  {step.state === "done" ? (
                    <Check size={11} className="text-white" />
                  ) : step.state === "active" ? (
                    <Loader2 size={11} className="text-[#9370ff] animate-spin" />
                  ) : (
                    <Icon size={10} className="text-fg-dim" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={clsx(
                    "text-[10px] text-center max-w-[72px] leading-tight",
                    step.state === "done" && "text-fg-muted",
                    step.state === "active" && "text-fg font-medium",
                    step.state === "pending" && "text-fg-dim"
                  )}
                >
                  {step.state === "active" ? step.label : step.icon === "send" ? "Send" : step.icon === "think" ? "Think" : step.icon === "receive" ? "Receive" : "Render"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
