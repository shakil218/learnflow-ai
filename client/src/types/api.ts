export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface RoadmapItem {
  _id: string;
  userId: string;
  title: string;
  topic: string;
  description: string;
  targetHoursPerWeek: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  status: "draft" | "in_progress" | "completed" | "archived";
  progressPercentage: number;
  totalEstimatedMinutes: number;
  completedMinutes: number;
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleItem {
  _id: string;
  roadmapId: string;
  userId: string;
  title: string;
  summary: string;
  order: number;
  estimatedMinutes: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  _id: string;
  moduleId: string;
  roadmapId: string;
  userId: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  order: number;
  estimatedMinutes: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyStats {
  totalMinutesLogged: number;
  currentStreak: number;
  totalStudyDays: number;
}

export interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
}

export interface QuizResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  gradedAnswers: {
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
    correctOptionIndex: number;
    explanation: string;
  }[];
}
