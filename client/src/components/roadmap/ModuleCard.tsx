"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Layers } from "lucide-react";
import { ModuleItem, TaskItem } from "@/types/api";
import { TaskItemRow } from "./TaskItemRow";
import { Button } from "@/components/ui/Button";

interface ModuleCardProps {
  module: ModuleItem;
  tasks: TaskItem[];
  onTaskStatusChange: (taskId: string, newStatus: "pending" | "in_progress" | "completed") => void;
  onAddTask?: (moduleId: string, taskTitle: string, minutes: number) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  module,
  tasks,
  onTaskStatusChange,
  onAddTask,
  onDeleteTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const isAllComplete = tasks.length > 0 && completedCount === tasks.length;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !onAddTask) return;

    onAddTask(module._id, newTaskTitle.trim(), newTaskMinutes);
    setNewTaskTitle("");
    setNewTaskMinutes(30);
    setIsAddingTask(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden mb-4 transition-all">
      {/* Module Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <button className="text-zinc-400">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/40">
              {module.order}
            </span>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              {module.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {completedCount} / {tasks.length} tasks
          </span>
          {isAllComplete && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Done
            </span>
          )}
        </div>
      </div>

      {/* Module Summary */}
      {module.summary && isExpanded && (
        <div className="px-5 pb-2 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-zinc-50 dark:border-zinc-800/50 pt-2">
          {module.summary}
        </div>
      )}

      {/* Expanded Tasks Section */}
      {isExpanded && (
        <div className="p-3 sm:p-4 bg-zinc-50/50 dark:bg-zinc-950/30 border-t border-zinc-100 dark:border-zinc-800">
          <div className="space-y-1">
            {tasks.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3 text-center italic">
                No tasks in this module yet. Add one below!
              </p>
            ) : (
              tasks.map((task) => (
                <TaskItemRow
                  key={task._id}
                  task={task}
                  onStatusChange={onTaskStatusChange}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </div>

          {/* Add Task Action */}
          {onAddTask && (
            <div className="mt-3 pt-2">
              {isAddingTask ? (
                <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-2 mt-2">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Task name (e.g. Read React documentation)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={5}
                      step={5}
                      value={newTaskMinutes}
                      onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                      className="w-20 px-2 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 focus:outline-none"
                    />
                    <span className="text-xs text-zinc-400">min</span>
                    <Button type="submit" variant="primary" size="sm">
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingTask(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors py-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
