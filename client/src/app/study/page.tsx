"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Flame, Clock, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { apiClient } from "@/lib/api-client";
import { ApiResponse, StudyStats, RoadmapItem } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function StudyHabitPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();

  const [stats, setStats] = useState<StudyStats>({
    totalMinutesLogged: 0,
    currentStreak: 0,
    totalStudyDays: 0,
  });
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState("");
  const [minutesSpent, setMinutesSpent] = useState(45);
  const [notes, setNotes] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatsAndRoadmaps = useCallback(async () => {
    try {
      const statsRes = await apiClient<ApiResponse<StudyStats>>("/api/study/stats");
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      const roadmapsRes = await apiClient<ApiResponse<RoadmapItem[]>>("/api/roadmaps");
      if (roadmapsRes.success && roadmapsRes.data) {
        setRoadmaps(roadmapsRes.data);
        if (roadmapsRes.data.length > 0) {
          setSelectedRoadmapId((prev) => prev || roadmapsRes.data[0]._id);
        }
      }
    } catch (err: unknown) {
      console.error("Error loading study metrics:", err);
    }
  }, []);

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push("/login");
      return;
    }
    if (session?.user) {
      fetchStatsAndRoadmaps();
    }
  }, [session, isSessionPending, router, fetchStatsAndRoadmaps]);

  const handleLogStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoadmapId) {
      setError("Please select a roadmap to log time against.");
      return;
    }

    setIsLogging(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await apiClient<ApiResponse<any>>("/api/study/logs", {
        data: {
          roadmapId: selectedRoadmapId,
          minutesSpent,
          notes: notes.trim(),
        },
      });

      if (res.success) {
        setSuccessMessage(`Logged ${minutesSpent} minutes successfully!`);
        setNotes("");
        fetchStatsAndRoadmaps();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to record study session.";
      setError(message);
    } finally {
      setIsLogging(false);
    }
  };

  const totalHours = (stats.totalMinutesLogged / 60).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Study Habit & Consistency Tracker
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Build uninterrupted daily learning streaks and measure your cumulative study hours
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Current Streak
              </span>
              <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {stats.currentStreak} {stats.currentStreak === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Total Study Time
              </span>
              <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {totalHours} Hours
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Active Study Days
              </span>
              <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
                {stats.totalStudyDays} Days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Session Logger Card */}
      <Card className="p-6 sm:p-8 max-w-2xl">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Log Today&apos;s Study Session
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          Keep your streak alive by recording minutes spent studying or completing tasks
        </p>

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogStudy} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Select Roadmap
            </label>
            <select
              value={selectedRoadmapId}
              onChange={(e) => setSelectedRoadmapId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
            >
              {roadmaps.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.title} ({r.topic})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Minutes Studied
            </label>
            <input
              type="number"
              min={5}
              max={600}
              step={5}
              value={minutesSpent}
              onChange={(e) => setMinutesSpent(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
              Session Takeaways & Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn or accomplish today?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-zinc-100 resize-none"
            />
          </div>

          <Button type="submit" variant="primary" size="md" isLoading={isLogging}>
            <Flame className="w-4 h-4 text-amber-300" />
            Record Study Session
          </Button>
        </form>
      </Card>
    </div>
  );
}
