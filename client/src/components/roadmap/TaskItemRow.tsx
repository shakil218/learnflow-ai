"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";
import { TaskItem } from "@/types/api";

interface TaskItemRowProps {
  task: TaskItem;
  onStatusChange: (taskId: string, newStatus: "pending" | "in_progress" | "completed") => void;
  onDelete?: (taskId: string) => void;
}

export const TaskItemRow: React.FC<TaskItemRowProps> = ({
  task,
  onStatusChange,
  onDelete,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleComplete = async () => {
    setIsUpdating(true);
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    await onStatusChange(task._id, nextStatus);
    setIsUpdating(false);
  };

  return (
    <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-800">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={toggleComplete}
          disabled={isUpdating}
          className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer flex-shrink-0"
        >
          {task.status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/60" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium tracking-tight truncate ${
              task.status === "completed"
                ? "line-through text-zinc-400 dark:text-zinc-500"
                : "text-zinc-800 dark:text-zinc-200"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-1 mt-0.5">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{task.estimatedMinutes}m</span>
        </div>

        {onDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-opacity cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
