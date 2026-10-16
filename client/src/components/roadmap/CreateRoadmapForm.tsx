"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { ApiResponse, RoadmapItem } from "@/types/api";

interface CreateRoadmapModalProps {
  onSuccess: (roadmap: RoadmapItem) => void;
  onCancel: () => void;
}

export const CreateRoadmapForm: React.FC<CreateRoadmapModalProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [targetHoursPerWeek, setTargetHoursPerWeek] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim()) {
      setError("Title and topic are required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient<ApiResponse<RoadmapItem>>("/api/roadmaps", {
        data: {
          title: title.trim(),
          topic: topic.trim(),
          description: description.trim(),
          difficulty,
          targetHoursPerWeek,
        },
      });

      if (response.success && response.data) {
        onSuccess(response.data);
      } else {
        setError(response.message || "Failed to create roadmap.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create roadmap.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
          Roadmap Title
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Master Full-Stack React & Node"
          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
          Core Topic / Technology
        </label>
        <input
          type="text"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Next.js & TypeScript"
          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) =>
              setDifficulty(
                e.target.value as "beginner" | "intermediate" | "advanced"
              )
            }
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Target Hrs / Wk
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={targetHoursPerWeek}
            onChange={(e) => setTargetHoursPerWeek(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
          Description (Optional)
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary of what you aim to achieve..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
          <Plus className="w-4 h-4" />
          Create Roadmap
        </Button>
      </div>
    </form>
  );
};
