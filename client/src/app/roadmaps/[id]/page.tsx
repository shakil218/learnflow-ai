"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Sparkles, BookOpen, CheckCircle, Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import { ApiResponse, RoadmapItem, ModuleItem, TaskItem } from "@/types/api";
import { ModuleCard } from "@/components/roadmap/ModuleCard";
import { QuizView } from "@/components/roadmap/QuizView";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = String(params.id);

  const { data: session, isPending: isSessionPending } = useSession();

  const [roadmap, setRoadmap] = useState<RoadmapItem | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"modules" | "quiz">("modules");
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient<
        ApiResponse<{
          roadmap: RoadmapItem;
          modules: ModuleItem[];
          tasks: TaskItem[];
        }>
      >(`/api/roadmaps/${roadmapId}`);

      if (res.success && res.data) {
        setRoadmap(res.data.roadmap);
        setModules(res.data.modules);
        setTasks(res.data.tasks);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load roadmap.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [roadmapId]);

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push("/login");
      return;
    }

    if (session?.user && roadmapId) {
      fetchDetails();
    }
  }, [session, isSessionPending, roadmapId, router, fetchDetails]);

  const handleTaskStatusChange = async (
    taskId: string,
    newStatus: "pending" | "in_progress" | "completed"
  ) => {
    try {
      const res = await apiClient<ApiResponse<TaskItem>>(`/api/planner/tasks/${taskId}/status`, {
        method: "PATCH",
        data: { status: newStatus },
      });

      if (res.success && res.data) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
        );
        // Refresh roadmap progress metrics
        const updatedRoadmap = await apiClient<
          ApiResponse<{ roadmap: RoadmapItem; modules: ModuleItem[]; tasks: TaskItem[] }>
        >(`/api/roadmaps/${roadmapId}`);
        if (updatedRoadmap.success && updatedRoadmap.data) {
          setRoadmap(updatedRoadmap.data.roadmap);
        }
      }
    } catch (err: unknown) {
      console.error("Error updating task status:", err);
    }
  };

  const handleAddTask = async (moduleId: string, taskTitle: string, minutes: number) => {
    try {
      const res = await apiClient<ApiResponse<TaskItem>>("/api/planner/tasks", {
        data: {
          roadmapId,
          moduleId,
          title: taskTitle,
          estimatedMinutes: minutes,
          order: tasks.filter((t) => t.moduleId === moduleId).length + 1,
        },
      });

      if (res.success && res.data) {
        setTasks((prev) => [...prev, res.data]);
        // Refresh progress
        const updated = await apiClient<
          ApiResponse<{ roadmap: RoadmapItem; modules: ModuleItem[]; tasks: TaskItem[] }>
        >(`/api/roadmaps/${roadmapId}`);
        if (updated.success && updated.data) {
          setRoadmap(updated.data.roadmap);
        }
      }
    } catch (err: unknown) {
      console.error("Error creating task:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient(`/api/planner/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err: unknown) {
      console.error("Error deleting task:", err);
    }
  };

  const handleDeleteRoadmap = async () => {
    if (!confirm("Are you sure you want to delete this entire roadmap?")) return;
    try {
      await apiClient(`/api/roadmaps/${roadmapId}`, { method: "DELETE" });
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Failed to delete roadmap:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading roadmap curriculum...
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-2">Roadmap Not Found</h2>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Roadmaps
        </Link>

        <Button
          onClick={handleDeleteRoadmap}
          variant="outline"
          size="sm"
          className="text-rose-600 hover:bg-rose-50 border-rose-200 dark:border-rose-900/50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Roadmap
        </Button>
      </div>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="indigo" size="md">
            {roadmap.difficulty.toUpperCase()}
          </Badge>
          {roadmap.aiGenerated && (
            <Badge variant="indigo" size="md" className="bg-indigo-50/80">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              AI Curriculum
            </Badge>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">
          {roadmap.title}
        </h1>

        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed mb-6">
          {roadmap.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div>
            <span className="text-xs text-zinc-400 uppercase font-semibold">Weekly Goal</span>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
              {roadmap.targetHoursPerWeek} hrs / week
            </p>
          </div>
          <div>
            <span className="text-xs text-zinc-400 uppercase font-semibold">Total Modules</span>
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
              {modules.length} Modules ({tasks.length} tasks)
            </p>
          </div>
          <div>
            <span className="text-xs text-zinc-400 uppercase font-semibold">Progress</span>
            <div className="mt-1">
              <ProgressBar progress={roadmap.progressPercentage} showLabel />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab("modules")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "modules"
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Modules & Tasks ({modules.length})
        </button>
        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === "quiz"
              ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          AI Skill Assessment
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "modules" ? (
        <div className="space-y-4">
          {modules.map((mod) => (
            <ModuleCard
              key={mod._id}
              module={mod}
              tasks={tasks.filter((t) => t.moduleId === mod._id)}
              onTaskStatusChange={handleTaskStatusChange}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      ) : (
        <QuizView roadmapId={roadmapId} />
      )}
    </div>
  );
}
