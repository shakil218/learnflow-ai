import { ITask } from "../types/models";

export interface ProgressSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  progressPercentage: number;
  totalEstimatedMinutes: number;
  completedMinutes: number;
}

/**
 * Calculates accurate progress metrics across all tasks within a roadmap.
 * Adheres to pure deterministic calculations for easy unit testing.
 */
export function calculateRoadmapProgress(tasks: ITask[]): ProgressSummary {
  if (!tasks || tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      pendingTasks: 0,
      progressPercentage: 0,
      totalEstimatedMinutes: 0,
      completedMinutes: 0,
    };
  }

  let completedTasks = 0;
  let inProgressTasks = 0;
  let pendingTasks = 0;
  let totalEstimatedMinutes = 0;
  let completedMinutes = 0;

  for (const task of tasks) {
    const taskMinutes = task.estimatedMinutes > 0 ? task.estimatedMinutes : 30;
    totalEstimatedMinutes += taskMinutes;

    if (task.status === "completed") {
      completedTasks += 1;
      completedMinutes += taskMinutes;
    } else if (task.status === "in_progress") {
      inProgressTasks += 1;
      completedMinutes += Math.round(taskMinutes * 0.4); // partial completion credit
    } else {
      pendingTasks += 1;
    }
  }

  const rawPercent = (completedMinutes / totalEstimatedMinutes) * 100;
  const progressPercentage = Math.min(100, Math.max(0, Math.round(rawPercent)));

  return {
    totalTasks: tasks.length,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    progressPercentage,
    totalEstimatedMinutes,
    completedMinutes,
  };
}

/**
 * Calculates current streak and target pace based on study logs.
 */
export function calculateStudyStreak(loggedDates: string[]): {
  currentStreak: number;
  totalStudyDays: number;
} {
  if (!loggedDates || loggedDates.length === 0) {
    return { currentStreak: 0, totalStudyDays: 0 };
  }

  // Deduplicate and sort descending (newest first)
  const uniqueDates = Array.from(new Set(loggedDates)).sort((a, b) => (a < b ? 1 : -1));
  const totalStudyDays = uniqueDates.length;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let currentStreak = 0;
  let checkDate = uniqueDates[0] === todayStr ? today : uniqueDates[0] === yesterdayStr ? yesterday : null;

  if (!checkDate) {
    return { currentStreak: 0, totalStudyDays };
  }

  let expected = new Date(checkDate);
  for (const dateStr of uniqueDates) {
    const expectedStr = expected.toISOString().split("T")[0];
    if (dateStr === expectedStr) {
      currentStreak += 1;
      expected.setDate(expected.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak, totalStudyDays };
}
