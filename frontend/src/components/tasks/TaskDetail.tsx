import {
  X,
  CheckCircle2,
  Loader2,
  Circle,
  AlertTriangle,
  ChevronRight,
  Clock,
  Wrench,
} from "lucide-react";
import clsx from "clsx";
import { useChatStore } from "../../store/chat";
import type { TaskStep } from "../../types";

const STATUS_META = {
  running: {
    label: "In Progress",
    color: "text-accent-hover",
    border: "border-accent/50",
    bg: "bg-accent/[0.03]",
  },
  completed: {
    label: "Approved",
    color: "text-[#4ade80]",
    border: "border-[#4ade80]/50",
    bg: "bg-[#4ade80]/[0.03]",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-[#f87171]",
    border: "border-[#f87171]/50",
    bg: "bg-[#f87171]/[0.03]",
  },
};

function formatDuration(start: number, end?: number) {
  if (!start) return "\u2014";
  const diff = (end ?? Date.now()) - start;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}

function formatTimeAgo(ts: number) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function MiniGhostJourney() {
  return (
    <svg width="18" height="18" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M64 10 C92 10 112 32 112 58 C112 84 92 106 64 106 C56 106 52 96 46 106 C40 96 34 106 28 96 C22 86 20 74 20 58 C20 32 40 10 64 10 Z"
        fill="url(#ghostGradTask)"
      />
      <ellipse cx="52" cy="58" rx="7" ry="9" fill="#3B0764" />
      <ellipse cx="76" cy="58" rx="7" ry="9" fill="#3B0764" />
      <circle cx="50" cy="54" r="2.5" fill="white" />
      <circle cx="74" cy="54" r="2.5" fill="white" />
      <defs>
        <radialGradient id="ghostGradTask" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#F5E9FF" />
          <stop offset="50%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6D28D9" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export default function TaskDetail() {
  const { tasks, activeTaskId, closeTask, setTaskStatus } = useChatStore();
  const task = tasks.find((t) => t.id === activeTaskId);
  if (!task) return null;

  const meta = STATUS_META[task.status];
  const doneCount = task.steps.filter((s) => s.status === "done").length;

  return (
    <div
      className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-0 md:p-8 fade-in-fast"
      onClick={closeTask}
    >
      <div
        className={clsx(
          "bg-bg-elevated border-0 md:border rounded-none md:rounded-2xl w-full max-w-3xl h-full md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden shadow-modal modal-enter",
          meta.border
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={clsx("px-4 md:px-6 pt-5 pb-4 border-b border-border", meta.bg)}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={clsx(
                    "text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full border",
                    meta.color,
                    meta.border
                  )}
                >
                  {meta.label}
                </span>
                {task.skill && (
                  <span className="text-[10px] text-fg-dim font-mono px-2 py-0.5 rounded-full bg-bg-surface border border-border">
                    #{task.skill}
                  </span>
                )}
              </div>
              <h1 className="text-lg font-semibold text-fg tracking-tight">
                {task.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-fg-dim">
                <span className="flex items-center gap-1">
                  <Clock size={10} />
                  Started {formatTimeAgo(task.createdAt)}
                </span>
                <span>
                  {doneCount}/{task.steps.length} steps
                </span>
                <span className="tabular-nums">{task.progress}%</span>
              </div>
            </div>
            <button
              onClick={closeTask}
              className="p-1.5 rounded-xl hover:bg-bg-surface text-fg-muted hover:text-fg transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-bg rounded-full overflow-hidden border border-border">
            <div
              className={clsx(
                "h-full rounded-full transition-all",
                task.status === "running" && "bg-gradient-to-r from-accent to-accent-hover",
                task.status === "completed" && "bg-[#4ade80]/70",
                task.status === "cancelled" && "bg-[#f87171]/70"
              )}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        {/* Steps — journey style */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5">
          <div className="text-[10px] font-semibold text-fg-dim tracking-wider uppercase mb-3 px-1 flex items-center gap-2">
            <MiniGhostJourney />
            Boo's Journey
          </div>
          <div className="space-y-2">
            {task.steps.map((step, idx) => (
              <StepRow
                key={step.id}
                step={step}
                index={idx}
                isLast={idx === task.steps.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        {task.status === "running" && (
          <div className="border-t border-border px-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-bg">
            <div className="text-[12px] text-fg-muted">
              Review and approve if Boo is on the right track.
            </div>
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => setTaskStatus(task.id, "cancelled")}
                className="text-xs font-medium px-4 py-2.5 rounded-full border border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/[0.05] hover:border-[#f87171] transition-all hover:scale-105 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => setTaskStatus(task.id, "completed")}
                className="text-xs font-semibold px-5 py-2.5 rounded-full bg-[#4ade80]/15 border border-[#4ade80]/40 text-[#4ade80] hover:bg-[#4ade80]/20 hover:border-[#4ade80] transition-all hover:scale-105 active:scale-95"
              >
                Looks good!
              </button>
            </div>
          </div>
        )}
        {task.status !== "running" && (
          <div
            className={clsx(
              "border-t border-border px-4 md:px-6 py-3 flex items-center justify-between",
              meta.bg
            )}
          >
            <div className={clsx("text-[11px] font-medium", meta.color)}>
              {task.status === "completed"
                ? `Approved ${formatTimeAgo(task.approvedAt ?? task.updatedAt)}`
                : `Cancelled ${formatTimeAgo(
                    task.cancelledAt ?? task.updatedAt
                  )}`}
            </div>
            <button
              onClick={() => setTaskStatus(task.id, "running")}
              className="text-[11px] text-fg-dim hover:text-fg transition-all px-3 py-1 rounded-full hover:bg-bg-surface"
            >
              Reopen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepRow({
  step,
  index,
  isLast,
}: {
  step: TaskStep;
  index: number;
  isLast: boolean;
}) {
  const iconMap = {
    done: { Icon: CheckCircle2, color: "text-[#4ade80]", border: "border-[#4ade80]/50" },
    running: { Icon: Loader2, color: "text-accent-hover", border: "border-accent/50", spin: true },
    failed: { Icon: AlertTriangle, color: "text-[#f87171]", border: "border-[#f87171]/50" },
    pending: { Icon: Circle, color: "text-fg-dim", border: "border-border-strong" },
  };
  const { Icon, color, border } = iconMap[step.status];
  const spin = step.status === "running";

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-[17px] top-10 bottom-[-8px] w-0.5 bg-gradient-to-b from-accent/30 to-border rounded-full" />
      )}
      <div
        className={clsx(
          "flex items-start gap-3 border rounded-xl px-4 py-3.5 transition-all",
          border,
          step.status === "running" && "bg-accent/[0.03]",
          step.status === "done" && "bg-[#4ade80]/[0.02]",
          step.status === "failed" && "bg-[#f87171]/[0.02]",
          step.status === "pending" && "opacity-50"
        )}
      >
        <div
          className={clsx(
            "flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center bg-bg",
            border
          )}
        >
          <Icon size={14} className={clsx(color, spin && "animate-spin")} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[9px] text-fg-dim font-mono tabular-nums bg-bg-surface px-1.5 py-0.5 rounded-full border border-border">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-xs font-medium text-fg truncate">
                {step.title}
              </span>
            </div>
            {step.startedAt > 0 && (
              <span className="text-[10px] text-fg-dim tabular-nums flex-shrink-0">
                {formatDuration(step.startedAt, step.completedAt)}
              </span>
            )}
          </div>
          {step.detail && (
            <div className="text-[11px] text-fg-muted mt-1 leading-relaxed">
              {step.detail}
            </div>
          )}
          {step.tool && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-fg-dim">
              <Wrench size={9} />
              <span className="font-mono">{step.tool}</span>
              <ChevronRight size={9} />
              <span className="capitalize">{step.status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
