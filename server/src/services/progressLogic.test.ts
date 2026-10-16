import assert from "node:assert";
import { calculateRoadmapProgress, calculateStudyStreak } from "./progressLogic";
import { ITask } from "../types/models";
import { ObjectId } from "mongodb";

console.log("Running business logic unit tests...");

// Test 1: Empty tasks list returns 0 progress
const emptyProgress = calculateRoadmapProgress([]);
assert.strictEqual(emptyProgress.totalTasks, 0);
assert.strictEqual(emptyProgress.progressPercentage, 0);
console.log("✓ Passed: Empty tasks progress test");

// Test 2: Mixed status progress calculation
const dummyId = new ObjectId();
const mockTasks: ITask[] = [
  {
    _id: new ObjectId(),
    roadmapId: dummyId,
    moduleId: dummyId,
    userId: "user-1",
    title: "Task 1",
    status: "completed",
    order: 1,
    estimatedMinutes: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    roadmapId: dummyId,
    moduleId: dummyId,
    userId: "user-1",
    title: "Task 2",
    status: "in_progress",
    order: 2,
    estimatedMinutes: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: new ObjectId(),
    roadmapId: dummyId,
    moduleId: dummyId,
    userId: "user-1",
    title: "Task 3",
    status: "pending",
    order: 3,
    estimatedMinutes: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const progress = calculateRoadmapProgress(mockTasks);
assert.strictEqual(progress.totalTasks, 3);
assert.strictEqual(progress.completedTasks, 1);
assert.strictEqual(progress.inProgressTasks, 1);
assert.strictEqual(progress.pendingTasks, 1);
// Completed = 60m, in_progress = 24m (40%), Total = 180m => 84/180 = 46.6% -> 47%
assert.strictEqual(progress.progressPercentage, 47);
console.log("✓ Passed: Weighted progress calculation test");

// Test 3: Streak calculation
const todayStr = new Date().toISOString().split("T")[0];
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split("T")[0];

const dayBefore = new Date();
dayBefore.setDate(dayBefore.getDate() - 2);
const dayBeforeStr = dayBefore.toISOString().split("T")[0];

const streak = calculateStudyStreak([todayStr, yesterdayStr, dayBeforeStr]);
assert.strictEqual(streak.currentStreak, 3);
assert.strictEqual(streak.totalStudyDays, 3);
console.log("✓ Passed: Consecutive days streak test");

console.log("All business logic unit tests passed successfully!");
