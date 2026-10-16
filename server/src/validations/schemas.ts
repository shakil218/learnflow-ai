import { z } from "zod";

export const CreateRoadmapSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  topic: z.string().min(2, "Topic is required"),
  description: z.string().max(1000).optional().default(""),
  targetHoursPerWeek: z.coerce.number().min(1, "Minimum 1 hour/week").max(80, "Maximum 80 hours/week").default(5),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
});

export const UpdateRoadmapSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(1000).optional(),
  targetHoursPerWeek: z.coerce.number().min(1).max(80).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  status: z.enum(["draft", "in_progress", "completed", "archived"]).optional(),
});

export const CreateModuleSchema = z.object({
  roadmapId: z.string().min(1, "Roadmap ID is required"),
  title: z.string().min(2, "Title is required").max(150),
  summary: z.string().max(1500).optional().default(""),
  order: z.coerce.number().int().nonnegative().default(0),
  estimatedMinutes: z.coerce.number().int().positive().default(60),
});

export const CreateTaskSchema = z.object({
  moduleId: z.string().min(1, "Module ID is required"),
  roadmapId: z.string().min(1, "Roadmap ID is required"),
  title: z.string().min(2, "Task title is required").max(200),
  description: z.string().max(2000).optional().default(""),
  estimatedMinutes: z.coerce.number().int().positive().default(30),
  order: z.coerce.number().int().nonnegative().default(0),
});

export const UpdateTaskStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed"]),
});

export const CreateStudyLogSchema = z.object({
  roadmapId: z.string().min(1, "Roadmap ID is required"),
  moduleId: z.string().optional(),
  minutesSpent: z.coerce.number().int().positive("Minutes spent must be positive"),
  notes: z.string().max(1000).optional(),
  loggedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").optional(),
});

export const GenerateAiRoadmapSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  targetSkillLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  weeklyAvailableHours: z.coerce.number().min(1).max(60).default(6),
  targetTimelineWeeks: z.coerce.number().min(1).max(24).default(4),
  learningGoals: z.string().max(500).optional(),
});

export const SubmitQuizSchema = z.object({
  roadmapId: z.string().min(1),
  moduleId: z.string().optional(),
  answers: z.array(
    z.object({
      questionIndex: z.number().int().nonnegative(),
      selectedOption: z.number().int().nonnegative(),
    })
  ).min(1, "At least one answer must be submitted"),
});

export type CreateRoadmapInput = z.infer<typeof CreateRoadmapSchema>;
export type UpdateRoadmapInput = z.infer<typeof UpdateRoadmapSchema>;
export type CreateModuleInput = z.infer<typeof CreateModuleSchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;
export type CreateStudyLogInput = z.infer<typeof CreateStudyLogSchema>;
export type GenerateAiRoadmapInput = z.infer<typeof GenerateAiRoadmapSchema>;
export type SubmitQuizInput = z.infer<typeof SubmitQuizSchema>;
