export const COLLECTIONS = {
  USERS: "user",
  SESSIONS: "session",
  ACCOUNTS: "account",
  VERIFICATIONS: "verification",
  ROADMAPS: "roadmaps",
  MODULES: "modules",
  TASKS: "tasks",
  STUDY_LOGS: "study_logs",
  QUIZ_ATTEMPTS: "quiz_attempts",
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
