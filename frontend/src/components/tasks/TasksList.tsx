import clsx from "clsx";
import { CheckCircle2, XCircle } from "lucide-react";
import { useChatStore } from "../../store/chat";
import type { Task } from "../../types";

export default function TasksList() {
  const { tasks, openTask } = useChatStore();

  const running = tasks.filter((t) => t.status === "running");
  const recent = tasks.filter((t) => t.status !== "running").slice(0, 2);
  const ordered = [...running, ...recent];

  if (ordered.length === 0) return null;

  return (
    <div className="px-3 pb-2">
      <div className="px-2 pb-2 text-[11px] text-fg-dim font-medium uppercase tracking-wider">Tasks</div>
      <div className="space-y-1.5">
        {ordered.slice(0, 4).map((t) => (
          <TaskRow key={t.id} task={t} onClick={() => openTask(t.id)} />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, onClick }: { task: Task; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full text-left border rounded-xl px-3.5 py-2.5 transition-all hover:scale-[1.01] active:scale-[0.99]",
        task.status === "running" && "border-accent/30 hover:border-accent/50",
        task.status === "completed" && "border-[#4ade80]/30 hover:border-[#4ade80]/50",
        task.status === "cancelled" && "border-[#f87171]/30 hover:border-[#f87171]/50",
      )}
    >
      <div className="flex items-center gap-2.5">
        {task.status === "running" && (
          <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-accent pulse-dot" />
        )}
        {task.status === "completed" && (
          <CheckCircle2 size={13} className="flex-shrink-0 text-[#4ade80]" />
        )}
        {task.status === "cancelled" && (
          <XCircle size={13} className="flex-shrink-0 text-[#f87171] line-through" />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[12px] text-fg truncate leading-tight">
            {task.title}
          </div>
          {task.status === "running" && (
            <div className="mt-1.5 h-1 bg-bg-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all"
                style={{ width: `${task.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
