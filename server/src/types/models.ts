import { ObjectId } from "mongodb";

export type RoadmapStatus = "draft" | "in_progress" | "completed" | "archived";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type TaskStatus = "pending" | "in_progress" | "completed";

export interface IUser {
  _id?: ObjectId | string;
  id?: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoadmap {
  _id?: ObjectId;
  userId: string;
  title: string;
  topic: string;
  description: string;
  targetHoursPerWeek: number;
  difficulty: DifficultyLevel;
  status: RoadmapStatus;
  progressPercentage: number;
  totalEstimatedMinutes: number;
  completedMinutes: number;
  aiGenerated: boolean;
  aiPrompt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IModule {
  _id?: ObjectId;
  roadmapId: ObjectId;
  userId: string;
  title: string;
  summary: string;
  order: number;
  estimatedMinutes: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask {
  _id?: ObjectId;
  moduleId: ObjectId;
  roadmapId: ObjectId;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  order: number;
  estimatedMinutes: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudyLog {
  _id?: ObjectId;
  userId: string;
  roadmapId: ObjectId;
  moduleId?: ObjectId;
  minutesSpent: number;
  notes?: string;
  loggedDate: string; // YYYY-MM-DD
  createdAt: Date;
}

export interface IQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface IQuizAttempt {
  _id?: ObjectId;
  userId: string;
  roadmapId: ObjectId;
  moduleId?: ObjectId;
  score: number;
  totalQuestions: number;
  passed: boolean;
  answers: {
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
  }[];
  createdAt: Date;
}
