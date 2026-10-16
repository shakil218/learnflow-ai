"use client";

import React, { useState } from "react";
import { Sparkles, Compass, Clock, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api-client";
import { ApiResponse, RoadmapItem } from "@/types/api";
import { useToast } from "@/components/ui/Toast";

interface AiRoadmapGeneratorProps {
  onSuccess: (newRoadmap: RoadmapItem) => void;
  onCancel: () => void;
}

export const AiRoadmapGenerator: React.FC<AiRoadmapGeneratorProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { success, error: toastError } = useToast();
  const [topic, setTopic] = useState("");
  const [targetSkillLevel, setTargetSkillLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [weeklyAvailableHours, setWeeklyAvailableHours] = useState(6);
  const [targetTimelineWeeks, setTargetTimelineWeeks] = useState(4);
  const [learningGoals, setLearningGoals] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a skill, framework, or topic.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient<ApiResponse<RoadmapItem>>("/api/roadmaps/ai/generate", {
        data: {
          topic: topic.trim(),
          targetSkillLevel,
          weeklyAvailableHours,
          targetTimelineWeeks,
          learningGoals: learningGoals.trim(),
        },
      });

      if (response.success && response.data) {
        success(`AI Roadmap for "${response.data.title}" synthesized successfully!`);
        onSuccess(response.data);
      } else {
        const errorMsg = response.message || "Failed to generate roadmap.";
        setError(errorMsg);
        toastError(errorMsg);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to synthesize AI curriculum.";
      setError(message);
      toastError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
          What skill or technology do you want to master?
        </label>
        <div className="relative">
          <Compass className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Docker & Kubernetes, Next.js 15, GraphQL, System Design"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
            Difficulty
          </label>
          <select
            value={targetSkillLevel}
            onChange={(e) =>
              setTargetSkillLevel(
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            Hours / Week
          </label>
          <input
            type="number"
            min={1}
            max={40}
            value={weeklyAvailableHours}
            onChange={(e) => setWeeklyAvailableHours(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            Weeks
          </label>
          <input
            type="number"
            min={1}
            max={24}
            value={targetTimelineWeeks}
            onChange={(e) => setTargetTimelineWeeks(Number(e.target.value))}
            className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
          Specific Learning Goal (Optional)
        </label>
        <textarea
          rows={2}
          value={learningGoals}
          onChange={(e) => setLearningGoals(e.target.value)}
          placeholder="e.g. Build a production microservices application, prepare for frontend lead interview"
          className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-900 transition-all text-zinc-900 dark:text-zinc-100 resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
          <Sparkles className="w-4 h-4 text-indigo-200" />
          Generate AI Roadmap
        </Button>
      </div>
    </form>
  );
};
