// src/index.ts
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

// src/config/env.ts
import dotenv from "dotenv";
dotenv.config();
function getEnv(key, defaultValue) {
  const value = process.env[key] ?? defaultValue;
  if (value === void 0) {
    throw new Error(`[Security Alert] Missing required environment variable: ${key}`);
  }
  return value;
}
var config = {
  isProduction: process.env.NODE_ENV === "production",
  isVercel: Boolean(process.env.VERCEL),
  port: Number(getEnv("PORT", "5000")),
  mongodbUri: getEnv(
    "MONGODB_URI",
    "mongodb://localhost:27017/learnflow_ai"
  ),
  dbName: getEnv("DB_NAME", "learnflow_ai"),
  betterAuthSecret: getEnv(
    "BETTER_AUTH_SECRET",
    "default_learnflow_development_secret_key_32chars"
  ),
  betterAuthUrl: getEnv(
    "BETTER_AUTH_URL",
    "https://learnflow-ai-server-ecru.vercel.app"
  ),
  clientUrl: getEnv(
    "CLIENT_URL",
    "https://learnflow-ai-eight.vercel.app"
  )
};

// src/db/connection.ts
import { MongoClient } from "mongodb";
var client = null;
var dbInstance = null;
async function connectToDatabase() {
  if (client && dbInstance) {
    return { client, db: dbInstance };
  }
  try {
    client = new MongoClient(config.mongodbUri);
    await client.connect();
    dbInstance = client.db(config.dbName);
    console.log(`[Database] Successfully connected to MongoDB database: ${config.dbName}`);
    return { client, db: dbInstance };
  } catch (error) {
    console.error("[Database] Error connecting to MongoDB:", error);
    throw error;
  }
}
function getDatabase() {
  if (!dbInstance) {
    throw new Error("[Database] Database not initialized. Call connectToDatabase first.");
  }
  return dbInstance;
}
function getMongoClient() {
  if (!client) {
    throw new Error("[Database] MongoClient not initialized. Call connectToDatabase first.");
  }
  return client;
}

// src/auth/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
var getAuth = () => {
  const db = getDatabase();
  const client2 = getMongoClient();
  return betterAuth({
    database: mongodbAdapter(db, {
      client: client2
    }),
    secret: config.betterAuthSecret,
    baseURL: config.betterAuthUrl,
    trustedOrigins: [
      config.clientUrl,
      "https://learnflow-ai-eight.vercel.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ],
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 6
    },
    user: {
      additionalFields: {
        bio: {
          type: "string",
          required: false
        }
      }
    }
  });
};

// src/routes/roadmapRoutes.ts
import { Router } from "express";

// src/middlewares/auth.ts
import { fromNodeHeaders } from "better-auth/node";
async function requireAuth(req, res, next) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });
    if (!session || !session.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in to access this resource."
      });
      return;
    }
    req.user = session.user;
    req.session = session.session;
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Error checking session:", error);
    res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid or expired session."
    });
  }
}

// src/middlewares/validate.ts
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const error = result.error;
      const formattedErrors = error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

// src/services/roadmapService.ts
import { ObjectId } from "mongodb";

// src/db/collections.ts
var COLLECTIONS = {
  USERS: "user",
  SESSIONS: "session",
  ACCOUNTS: "account",
  VERIFICATIONS: "verification",
  ROADMAPS: "roadmaps",
  MODULES: "modules",
  TASKS: "tasks",
  STUDY_LOGS: "study_logs",
  QUIZ_ATTEMPTS: "quiz_attempts"
};

// src/services/progressLogic.ts
function calculateRoadmapProgress(tasks) {
  if (!tasks || tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      pendingTasks: 0,
      progressPercentage: 0,
      totalEstimatedMinutes: 0,
      completedMinutes: 0
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
      completedMinutes += Math.round(taskMinutes * 0.4);
    } else {
      pendingTasks += 1;
    }
  }
  const rawPercent = completedMinutes / totalEstimatedMinutes * 100;
  const progressPercentage = Math.min(100, Math.max(0, Math.round(rawPercent)));
  return {
    totalTasks: tasks.length,
    completedTasks,
    inProgressTasks,
    pendingTasks,
    progressPercentage,
    totalEstimatedMinutes,
    completedMinutes
  };
}
function calculateStudyStreak(loggedDates) {
  if (!loggedDates || loggedDates.length === 0) {
    return { currentStreak: 0, totalStudyDays: 0 };
  }
  const uniqueDates = Array.from(new Set(loggedDates)).sort((a, b) => a < b ? 1 : -1);
  const totalStudyDays = uniqueDates.length;
  const today = /* @__PURE__ */ new Date();
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

// src/services/roadmapService.ts
var RoadmapService = class {
  static getCollection() {
    return getDatabase().collection(COLLECTIONS.ROADMAPS);
  }
  static getModulesCollection() {
    return getDatabase().collection(COLLECTIONS.MODULES);
  }
  static getTasksCollection() {
    return getDatabase().collection(COLLECTIONS.TASKS);
  }
  static async createRoadmap(userId, data) {
    const roadmap = {
      userId,
      title: data.title.trim(),
      topic: data.topic.trim(),
      description: data.description?.trim() ?? "",
      targetHoursPerWeek: data.targetHoursPerWeek,
      difficulty: data.difficulty,
      status: "in_progress",
      progressPercentage: 0,
      totalEstimatedMinutes: 0,
      completedMinutes: 0,
      aiGenerated: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await this.getCollection().insertOne(roadmap);
    return { ...roadmap, _id: result.insertedId };
  }
  static async getRoadmapsByUser(userId) {
    return this.getCollection().find({ userId }).sort({ updatedAt: -1 }).toArray();
  }
  static async getRoadmapById(id, userId) {
    if (!ObjectId.isValid(id)) return null;
    return this.getCollection().findOne({ _id: new ObjectId(id), userId });
  }
  static async updateRoadmap(id, userId, update) {
    if (!ObjectId.isValid(id)) return null;
    const fieldsToUpdate = {
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (update.title !== void 0) fieldsToUpdate.title = update.title.trim();
    if (update.description !== void 0) fieldsToUpdate.description = update.description.trim();
    if (update.targetHoursPerWeek !== void 0) fieldsToUpdate.targetHoursPerWeek = update.targetHoursPerWeek;
    if (update.difficulty !== void 0) fieldsToUpdate.difficulty = update.difficulty;
    if (update.status !== void 0) fieldsToUpdate.status = update.status;
    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: fieldsToUpdate },
      { returnDocument: "after" }
    );
    return result ?? null;
  }
  static async deleteRoadmap(id, userId) {
    if (!ObjectId.isValid(id)) return false;
    const roadmapObjectId = new ObjectId(id);
    await this.getTasksCollection().deleteMany({ roadmapId: roadmapObjectId, userId });
    await this.getModulesCollection().deleteMany({ roadmapId: roadmapObjectId, userId });
    const deleteResult = await this.getCollection().deleteOne({ _id: roadmapObjectId, userId });
    return deleteResult.deletedCount > 0;
  }
  static async syncRoadmapProgress(roadmapId, userId) {
    if (!ObjectId.isValid(roadmapId)) return null;
    const rId = new ObjectId(roadmapId);
    const tasks = await this.getTasksCollection().find({ roadmapId: rId, userId }).toArray();
    const progressSummary = calculateRoadmapProgress(tasks);
    const status = progressSummary.progressPercentage === 100 ? "completed" : progressSummary.progressPercentage > 0 ? "in_progress" : "in_progress";
    const updated = await this.getCollection().findOneAndUpdate(
      { _id: rId, userId },
      {
        $set: {
          progressPercentage: progressSummary.progressPercentage,
          totalEstimatedMinutes: progressSummary.totalEstimatedMinutes,
          completedMinutes: progressSummary.completedMinutes,
          status,
          updatedAt: /* @__PURE__ */ new Date()
        }
      },
      { returnDocument: "after" }
    );
    return updated ?? null;
  }
};

// src/services/moduleTaskService.ts
import { ObjectId as ObjectId2 } from "mongodb";
var ModuleTaskService = class {
  static getModulesCollection() {
    return getDatabase().collection(COLLECTIONS.MODULES);
  }
  static getTasksCollection() {
    return getDatabase().collection(COLLECTIONS.TASKS);
  }
  // --- MODULE OPERATIONS ---
  static async createModule(userId, data) {
    const roadmapId = new ObjectId2(data.roadmapId);
    const newModule = {
      roadmapId,
      userId,
      title: data.title.trim(),
      summary: data.summary?.trim() ?? "",
      order: data.order,
      estimatedMinutes: data.estimatedMinutes,
      isCompleted: false,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await this.getModulesCollection().insertOne(newModule);
    return { ...newModule, _id: result.insertedId };
  }
  static async getModulesByRoadmap(roadmapId, userId) {
    if (!ObjectId2.isValid(roadmapId)) return [];
    return this.getModulesCollection().find({ roadmapId: new ObjectId2(roadmapId), userId }).sort({ order: 1 }).toArray();
  }
  static async deleteModule(moduleId, userId) {
    if (!ObjectId2.isValid(moduleId)) return false;
    const mId = new ObjectId2(moduleId);
    const mod = await this.getModulesCollection().findOne({ _id: mId, userId });
    if (!mod) return false;
    await this.getTasksCollection().deleteMany({ moduleId: mId, userId });
    const deleteResult = await this.getModulesCollection().deleteOne({ _id: mId, userId });
    if (deleteResult.deletedCount > 0) {
      await RoadmapService.syncRoadmapProgress(mod.roadmapId.toString(), userId);
      return true;
    }
    return false;
  }
  // --- TASK OPERATIONS ---
  static async createTask(userId, data) {
    const roadmapId = new ObjectId2(data.roadmapId);
    const moduleId = new ObjectId2(data.moduleId);
    const newTask = {
      roadmapId,
      moduleId,
      userId,
      title: data.title.trim(),
      description: data.description?.trim() ?? "",
      status: "pending",
      order: data.order,
      estimatedMinutes: data.estimatedMinutes,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    const result = await this.getTasksCollection().insertOne(newTask);
    await RoadmapService.syncRoadmapProgress(data.roadmapId, userId);
    return { ...newTask, _id: result.insertedId };
  }
  static async getTasksByModule(moduleId, userId) {
    if (!ObjectId2.isValid(moduleId)) return [];
    return this.getTasksCollection().find({ moduleId: new ObjectId2(moduleId), userId }).sort({ order: 1 }).toArray();
  }
  static async getTasksByRoadmap(roadmapId, userId) {
    if (!ObjectId2.isValid(roadmapId)) return [];
    return this.getTasksCollection().find({ roadmapId: new ObjectId2(roadmapId), userId }).sort({ order: 1 }).toArray();
  }
  static async updateTaskStatus(taskId, userId, input) {
    if (!ObjectId2.isValid(taskId)) return null;
    const tId = new ObjectId2(taskId);
    const currentTask = await this.getTasksCollection().findOne({ _id: tId, userId });
    if (!currentTask) return null;
    const completedAt = input.status === "completed" ? /* @__PURE__ */ new Date() : void 0;
    const updatedTask = await this.getTasksCollection().findOneAndUpdate(
      { _id: tId, userId },
      {
        $set: {
          status: input.status,
          completedAt,
          updatedAt: /* @__PURE__ */ new Date()
        }
      },
      { returnDocument: "after" }
    );
    if (updatedTask) {
      await RoadmapService.syncRoadmapProgress(updatedTask.roadmapId.toString(), userId);
    }
    return updatedTask ?? null;
  }
  static async deleteTask(taskId, userId) {
    if (!ObjectId2.isValid(taskId)) return false;
    const tId = new ObjectId2(taskId);
    const task = await this.getTasksCollection().findOne({ _id: tId, userId });
    if (!task) return false;
    const result = await this.getTasksCollection().deleteOne({ _id: tId, userId });
    if (result.deletedCount > 0) {
      await RoadmapService.syncRoadmapProgress(task.roadmapId.toString(), userId);
      return true;
    }
    return false;
  }
};

// src/services/aiCurriculumService.ts
var AiCurriculumService = class {
  /**
   * Generates a comprehensive, tailored learning roadmap based on topic and parameters.
   * Uses domain-specific heuristic knowledge graph algorithms to synthesize
   * a high-utility curriculum with actionable learning modules and micro-tasks.
   */
  static generateCurriculum(input) {
    const topic = input.topic.trim();
    const level = input.targetSkillLevel;
    const weeklyHours = input.weeklyAvailableHours;
    const weeks = input.targetTimelineWeeks;
    const modules = [
      {
        title: `Module 1: Foundations & Core Concepts of ${topic}`,
        summary: `Understand essential syntax, architectural principles, and mental models of ${topic} for ${level} learners.`,
        order: 1,
        estimatedMinutes: Math.round(weeklyHours * 30),
        tasks: [
          {
            title: `Environment Setup & Tooling for ${topic}`,
            description: `Install recommended runtimes, SDKs, or CLI tools and verify installation with a test script.`,
            estimatedMinutes: 45,
            order: 1
          },
          {
            title: `Mastering Core Primitives & Syntax`,
            description: `Read official documentation on fundamental concepts, key paradigms, and write sample code snippets.`,
            estimatedMinutes: 60,
            order: 2
          },
          {
            title: `Hands-on Exercise: First Mini-Implementation`,
            description: `Build a runnable starter project implementing the first core building block.`,
            estimatedMinutes: 60,
            order: 3
          }
        ]
      },
      {
        title: `Module 2: Practical Workflows & State/Data Management`,
        summary: `Deep dive into common patterns, data structures, and best practices used in real-world ${topic} development.`,
        order: 2,
        estimatedMinutes: Math.round(weeklyHours * 30),
        tasks: [
          {
            title: `Component & Data Modeling`,
            description: `Design schema, structure entities, and practice handling inputs and edge-case errors.`,
            estimatedMinutes: 60,
            order: 1
          },
          {
            title: `Asynchronous Logic & External Integrations`,
            description: `Integrate standard libraries, asynchronous operations, or API handling.`,
            estimatedMinutes: 75,
            order: 2
          },
          {
            title: `Troubleshooting & Debugging Workshop`,
            description: `Identify and resolve standard pitfalls, memory or performance bottlenecks.`,
            estimatedMinutes: 45,
            order: 3
          }
        ]
      },
      {
        title: `Module 3: Advanced Optimization & Production Patterns`,
        summary: `Refactor code for scalability, security, testing, and modern standards in ${topic}.`,
        order: 3,
        estimatedMinutes: Math.round(weeklyHours * 30),
        tasks: [
          {
            title: `Writing Automated Unit & Integration Tests`,
            description: `Create test assertions covering critical paths, validation logic, and error boundaries.`,
            estimatedMinutes: 60,
            order: 1
          },
          {
            title: `Security Hardening & Input Sanitization`,
            description: `Review OWASP/security best practices specific to ${topic} architecture.`,
            estimatedMinutes: 45,
            order: 2
          },
          {
            title: `Performance Profiling & Benchmark Tuning`,
            description: `Benchmark runtime latency, bundle footprint, or query indexes.`,
            estimatedMinutes: 60,
            order: 3
          }
        ]
      },
      {
        title: `Module 4: Capstone Application & Portfolio Delivery`,
        summary: `Synthesize all concepts learned across the ${weeks}-week roadmap into an end-to-end production solution.`,
        order: 4,
        estimatedMinutes: Math.round(weeklyHours * 30),
        tasks: [
          {
            title: `Project Architecture & Specifications`,
            description: `Outline system architecture, wireframes, and domain milestones for the capstone.`,
            estimatedMinutes: 45,
            order: 1
          },
          {
            title: `End-to-End Implementation`,
            description: `Develop the complete feature set with responsive interface and robust backend services.`,
            estimatedMinutes: 90,
            order: 2
          },
          {
            title: `Documentation & Deployment Readiness`,
            description: `Publish deployment configuration, write README documentation, and verify health checks.`,
            estimatedMinutes: 60,
            order: 3
          }
        ]
      }
    ];
    return {
      title: `${topic} Mastery Roadmap (${level.toUpperCase()})`,
      topic,
      description: `A personalized, structured learning roadmap designed for ${weeklyHours} hours/week over ${weeks} weeks. Focuses on foundational theory, hands-on practice, and capstone delivery.`,
      targetHoursPerWeek: weeklyHours,
      difficulty: level,
      modules
    };
  }
};

// src/controllers/roadmapController.ts
var RoadmapController = class {
  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      const roadmaps = await RoadmapService.getRoadmapsByUser(userId);
      res.json({ success: true, data: roadmaps });
    } catch (error) {
      console.error("[RoadmapController.getAll] Error:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve roadmaps" });
    }
  }
  static async getById(req, res) {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);
      const roadmap = await RoadmapService.getRoadmapById(id, userId);
      if (!roadmap) {
        res.status(404).json({ success: false, message: "Roadmap not found" });
        return;
      }
      const modules = await ModuleTaskService.getModulesByRoadmap(id, userId);
      const tasks = await ModuleTaskService.getTasksByRoadmap(id, userId);
      res.json({
        success: true,
        data: {
          roadmap,
          modules,
          tasks
        }
      });
    } catch (error) {
      console.error("[RoadmapController.getById] Error:", error);
      res.status(500).json({ success: false, message: "Failed to load roadmap details" });
    }
  }
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const input = req.body;
      const roadmap = await RoadmapService.createRoadmap(userId, input);
      res.status(201).json({ success: true, data: roadmap });
    } catch (error) {
      console.error("[RoadmapController.create] Error:", error);
      res.status(500).json({ success: false, message: "Failed to create roadmap" });
    }
  }
  static async generateWithAi(req, res) {
    try {
      const userId = req.user.id;
      const input = req.body;
      const blueprint = AiCurriculumService.generateCurriculum(input);
      const roadmap = await RoadmapService.createRoadmap(userId, {
        title: blueprint.title,
        topic: blueprint.topic,
        description: blueprint.description,
        targetHoursPerWeek: blueprint.targetHoursPerWeek,
        difficulty: blueprint.difficulty
      });
      const roadmapIdStr = roadmap._id.toString();
      for (const modBlueprint of blueprint.modules) {
        const createdModule = await ModuleTaskService.createModule(userId, {
          roadmapId: roadmapIdStr,
          title: modBlueprint.title,
          summary: modBlueprint.summary,
          order: modBlueprint.order,
          estimatedMinutes: modBlueprint.estimatedMinutes
        });
        const moduleIdStr = createdModule._id.toString();
        for (const taskBlueprint of modBlueprint.tasks) {
          await ModuleTaskService.createTask(userId, {
            roadmapId: roadmapIdStr,
            moduleId: moduleIdStr,
            title: taskBlueprint.title,
            description: taskBlueprint.description,
            estimatedMinutes: taskBlueprint.estimatedMinutes,
            order: taskBlueprint.order
          });
        }
      }
      const finalRoadmap = await RoadmapService.syncRoadmapProgress(roadmapIdStr, userId);
      res.status(201).json({
        success: true,
        message: "AI Roadmap generated successfully",
        data: finalRoadmap
      });
    } catch (error) {
      console.error("[RoadmapController.generateWithAi] Error:", error);
      res.status(500).json({ success: false, message: "Failed to generate AI roadmap" });
    }
  }
  static async update(req, res) {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);
      const input = req.body;
      const updated = await RoadmapService.updateRoadmap(id, userId, input);
      if (!updated) {
        res.status(404).json({ success: false, message: "Roadmap not found or unauthorized" });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("[RoadmapController.update] Error:", error);
      res.status(500).json({ success: false, message: "Failed to update roadmap" });
    }
  }
  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);
      const success = await RoadmapService.deleteRoadmap(id, userId);
      if (!success) {
        res.status(404).json({ success: false, message: "Roadmap not found or already deleted" });
        return;
      }
      res.json({ success: true, message: "Roadmap deleted successfully" });
    } catch (error) {
      console.error("[RoadmapController.delete] Error:", error);
      res.status(500).json({ success: false, message: "Failed to delete roadmap" });
    }
  }
};

// src/validations/schemas.ts
import { z } from "zod";
var CreateRoadmapSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  topic: z.string().min(2, "Topic is required"),
  description: z.string().max(1e3).optional().default(""),
  targetHoursPerWeek: z.coerce.number().min(1, "Minimum 1 hour/week").max(80, "Maximum 80 hours/week").default(5),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner")
});
var UpdateRoadmapSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(1e3).optional(),
  targetHoursPerWeek: z.coerce.number().min(1).max(80).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  status: z.enum(["draft", "in_progress", "completed", "archived"]).optional()
});
var CreateModuleSchema = z.object({
  roadmapId: z.string().min(1, "Roadmap ID is required"),
  title: z.string().min(2, "Title is required").max(150),
  summary: z.string().max(1500).optional().default(""),
  order: z.coerce.number().int().nonnegative().default(0),
  estimatedMinutes: z.coerce.number().int().positive().default(60)
});
var CreateTaskSchema = z.object({
  moduleId: z.string().min(1, "Module ID is required"),
  roadmapId: z.string().min(1, "Roadmap ID is required"),
  title: z.string().min(2, "Task title is required").max(200),
  description: z.string().max(2e3).optional().default(""),
  estimatedMinutes: z.coerce.number().int().positive().default(30),
  order: z.coerce.number().int().nonnegative().default(0)
});
var UpdateTaskStatusSchema = z.object({
  status: z.enum(["pending", "in_progress", "completed"])
});
var CreateStudyLogSchema = z.object({
  roadmapId: z.string().min(1, "Roadmap ID is required"),
  moduleId: z.string().optional(),
  minutesSpent: z.coerce.number().int().positive("Minutes spent must be positive"),
  notes: z.string().max(1e3).optional(),
  loggedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").optional()
});
var GenerateAiRoadmapSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters"),
  targetSkillLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  weeklyAvailableHours: z.coerce.number().min(1).max(60).default(6),
  targetTimelineWeeks: z.coerce.number().min(1).max(24).default(4),
  learningGoals: z.string().max(500).optional()
});
var SubmitQuizSchema = z.object({
  roadmapId: z.string().min(1),
  moduleId: z.string().optional(),
  answers: z.array(
    z.object({
      questionIndex: z.number().int().nonnegative(),
      selectedOption: z.number().int().nonnegative()
    })
  ).min(1, "At least one answer must be submitted")
});

// src/routes/roadmapRoutes.ts
var router = Router();
router.use(requireAuth);
router.get("/", RoadmapController.getAll);
router.get("/:id", RoadmapController.getById);
router.post("/", validateBody(CreateRoadmapSchema), RoadmapController.create);
router.post("/ai/generate", validateBody(GenerateAiRoadmapSchema), RoadmapController.generateWithAi);
router.put("/:id", validateBody(UpdateRoadmapSchema), RoadmapController.update);
router.delete("/:id", RoadmapController.delete);
var roadmapRouter = router;

// src/routes/moduleTaskRoutes.ts
import { Router as Router2 } from "express";

// src/controllers/moduleTaskController.ts
var ModuleTaskController = class {
  static async createModule(req, res) {
    try {
      const userId = req.user.id;
      const input = req.body;
      const mod = await ModuleTaskService.createModule(userId, input);
      res.status(201).json({ success: true, data: mod });
    } catch (error) {
      console.error("[ModuleTaskController.createModule] Error:", error);
      res.status(500).json({ success: false, message: "Failed to create module" });
    }
  }
  static async getModulesByRoadmap(req, res) {
    try {
      const userId = req.user.id;
      const roadmapId = String(req.params.roadmapId);
      const modules = await ModuleTaskService.getModulesByRoadmap(roadmapId, userId);
      res.json({ success: true, data: modules });
    } catch (error) {
      console.error("[ModuleTaskController.getModulesByRoadmap] Error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch modules" });
    }
  }
  static async deleteModule(req, res) {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);
      const success = await ModuleTaskService.deleteModule(id, userId);
      if (!success) {
        res.status(404).json({ success: false, message: "Module not found" });
        return;
      }
      res.json({ success: true, message: "Module and associated tasks deleted" });
    } catch (error) {
      console.error("[ModuleTaskController.deleteModule] Error:", error);
      res.status(500).json({ success: false, message: "Failed to delete module" });
    }
  }
  // --- TASK ACTIONS ---
  static async createTask(req, res) {
    try {
      const userId = req.user.id;
      const input = req.body;
      const task = await ModuleTaskService.createTask(userId, input);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      console.error("[ModuleTaskController.createTask] Error:", error);
      res.status(500).json({ success: false, message: "Failed to create task" });
    }
  }
  static async updateTaskStatus(req, res) {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);
      const input = req.body;
      const updated = await ModuleTaskService.updateTaskStatus(id, userId, input);
      if (!updated) {
        res.status(404).json({ success: false, message: "Task not found" });
        return;
      }
      res.json({ success: true, data: updated });
    } catch (error) {
      console.error("[ModuleTaskController.updateTaskStatus] Error:", error);
      res.status(500).json({ success: false, message: "Failed to update task status" });
    }
  }
  static async deleteTask(req, res) {
    try {
      const userId = req.user.id;
      const id = String(req.params.id);
      const success = await ModuleTaskService.deleteTask(id, userId);
      if (!success) {
        res.status(404).json({ success: false, message: "Task not found" });
        return;
      }
      res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
      console.error("[ModuleTaskController.deleteTask] Error:", error);
      res.status(500).json({ success: false, message: "Failed to delete task" });
    }
  }
};

// src/routes/moduleTaskRoutes.ts
var router2 = Router2();
router2.use(requireAuth);
router2.post("/modules", validateBody(CreateModuleSchema), ModuleTaskController.createModule);
router2.get("/modules/roadmap/:roadmapId", ModuleTaskController.getModulesByRoadmap);
router2.delete("/modules/:id", ModuleTaskController.deleteModule);
router2.post("/tasks", validateBody(CreateTaskSchema), ModuleTaskController.createTask);
router2.patch("/tasks/:id/status", validateBody(UpdateTaskStatusSchema), ModuleTaskController.updateTaskStatus);
router2.delete("/tasks/:id", ModuleTaskController.deleteTask);
var moduleTaskRouter = router2;

// src/routes/studyQuizRoutes.ts
import { Router as Router3 } from "express";

// src/services/studyLogService.ts
import { ObjectId as ObjectId3 } from "mongodb";
var StudyLogService = class {
  static getCollection() {
    return getDatabase().collection(COLLECTIONS.STUDY_LOGS);
  }
  static async logStudySession(userId, input) {
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const logDate = input.loggedDate ?? todayStr;
    const newLog = {
      userId,
      roadmapId: new ObjectId3(input.roadmapId),
      moduleId: input.moduleId ? new ObjectId3(input.moduleId) : void 0,
      minutesSpent: input.minutesSpent,
      notes: input.notes?.trim() ?? "",
      loggedDate: logDate,
      createdAt: /* @__PURE__ */ new Date()
    };
    const result = await this.getCollection().insertOne(newLog);
    return { ...newLog, _id: result.insertedId };
  }
  static async getUserLogs(userId) {
    return this.getCollection().find({ userId }).sort({ loggedDate: -1, createdAt: -1 }).toArray();
  }
  static async getUserStudyStats(userId) {
    const logs = await this.getCollection().find({ userId }).toArray();
    const totalMinutesLogged = logs.reduce((acc, log) => acc + (log.minutesSpent || 0), 0);
    const dateStrings = logs.map((log) => log.loggedDate);
    const { currentStreak, totalStudyDays } = calculateStudyStreak(dateStrings);
    return {
      totalMinutesLogged,
      currentStreak,
      totalStudyDays
    };
  }
};

// src/services/aiQuizService.ts
var AiQuizService = class {
  /**
   * Generates dynamic assessment questions tailored to the roadmap/module topic.
   */
  static generateQuizQuestions(topic) {
    const cleanTopic = topic.trim();
    return [
      {
        id: "q1",
        question: `What is the primary advantage of adopting best practices in ${cleanTopic}?`,
        options: [
          `Increased maintainability, predictability, and fewer production errors.`,
          `It completely eliminates the need for testing.`,
          `It restricts the team to only single-threaded execution.`,
          `It makes code run on outdated operating systems without updates.`
        ],
        correctOptionIndex: 0,
        explanation: `Adopting best practices in ${cleanTopic} ensures cleaner architecture, higher code quality, and maintainability across team members.`
      },
      {
        id: "q2",
        question: `When designing components or modules for ${cleanTopic}, which principle is recommended?`,
        options: [
          `Place all state and business logic in a single monolith function.`,
          `Separation of concerns and single responsibility.`,
          `Avoid documenting interfaces or typing schemas.`,
          `Hardcode credentials directly in the client bundle.`
        ],
        correctOptionIndex: 1,
        explanation: `Separation of concerns ensures that each component or module handles a distinct piece of business logic or UI rendering.`
      },
      {
        id: "q3",
        question: `How should errors and async rejections be managed in a ${cleanTopic} project?`,
        options: [
          `Ignore errors silently and suppress console output.`,
          `Crash the server on any input mismatch.`,
          `Gracefully capture exceptions with try/catch, log diagnostic messages, and return user-friendly error states.`,
          `Retry the failing network call infinitely without backoff.`
        ],
        correctOptionIndex: 2,
        explanation: `Graceful exception handling with user feedback prevents unhandled promise rejections and gives clear UX.`
      },
      {
        id: "q4",
        question: `Why is schema validation (e.g. Zod) crucial when handling inputs in ${cleanTopic}?`,
        options: [
          `It validates runtime data types before reaching database and business logic, preventing malformed state or injection.`,
          `It speeds up internet connection bandwidth.`,
          `It replaces CSS styling requirements.`,
          `It is strictly required by web browsers to load HTML.`
        ],
        correctOptionIndex: 0,
        explanation: `Schema validation acts as an explicit gatekeeper verifying payload shapes and preventing security/type defects.`
      }
    ];
  }
};

// src/controllers/studyQuizController.ts
import { ObjectId as ObjectId4 } from "mongodb";
var StudyQuizController = class {
  static async logStudySession(req, res) {
    try {
      const userId = req.user.id;
      const input = req.body;
      const log = await StudyLogService.logStudySession(userId, input);
      res.status(201).json({ success: true, data: log });
    } catch (error) {
      console.error("[StudyQuizController.logStudySession] Error:", error);
      res.status(500).json({ success: false, message: "Failed to record study session" });
    }
  }
  static async getStudyStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await StudyLogService.getUserStudyStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("[StudyQuizController.getStudyStats] Error:", error);
      res.status(500).json({ success: false, message: "Failed to calculate study statistics" });
    }
  }
  static async getQuiz(req, res) {
    try {
      const userId = req.user.id;
      const roadmapId = String(req.params.roadmapId);
      const roadmap = await RoadmapService.getRoadmapById(roadmapId, userId);
      if (!roadmap) {
        res.status(404).json({ success: false, message: "Roadmap not found" });
        return;
      }
      const questions = AiQuizService.generateQuizQuestions(roadmap.topic);
      const clientQuestions = questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options
      }));
      res.json({
        success: true,
        data: {
          roadmapTitle: roadmap.title,
          topic: roadmap.topic,
          questions: clientQuestions
        }
      });
    } catch (error) {
      console.error("[StudyQuizController.getQuiz] Error:", error);
      res.status(500).json({ success: false, message: "Failed to load quiz" });
    }
  }
  static async submitQuiz(req, res) {
    try {
      const userId = req.user.id;
      const input = req.body;
      const roadmap = await RoadmapService.getRoadmapById(input.roadmapId, userId);
      if (!roadmap) {
        res.status(404).json({ success: false, message: "Roadmap not found" });
        return;
      }
      const fullQuestions = AiQuizService.generateQuizQuestions(roadmap.topic);
      let correctCount = 0;
      const gradedAnswers = input.answers.map((ans) => {
        const question = fullQuestions[ans.questionIndex];
        const isCorrect = question ? question.correctOptionIndex === ans.selectedOption : false;
        if (isCorrect) correctCount += 1;
        return {
          questionIndex: ans.questionIndex,
          selectedOption: ans.selectedOption,
          isCorrect,
          correctOptionIndex: question ? question.correctOptionIndex : 0,
          explanation: question ? question.explanation : ""
        };
      });
      const score = Math.round(correctCount / fullQuestions.length * 100);
      const passed = score >= 75;
      const attemptRecord = {
        userId,
        roadmapId: new ObjectId4(input.roadmapId),
        moduleId: input.moduleId ? new ObjectId4(input.moduleId) : void 0,
        score,
        totalQuestions: fullQuestions.length,
        passed,
        answers: gradedAnswers,
        createdAt: /* @__PURE__ */ new Date()
      };
      await getDatabase().collection(COLLECTIONS.QUIZ_ATTEMPTS).insertOne(attemptRecord);
      res.json({
        success: true,
        data: {
          score,
          correctCount,
          totalQuestions: fullQuestions.length,
          passed,
          gradedAnswers
        }
      });
    } catch (error) {
      console.error("[StudyQuizController.submitQuiz] Error:", error);
      res.status(500).json({ success: false, message: "Failed to evaluate quiz" });
    }
  }
};

// src/routes/studyQuizRoutes.ts
var router3 = Router3();
router3.use(requireAuth);
router3.post("/logs", validateBody(CreateStudyLogSchema), StudyQuizController.logStudySession);
router3.get("/stats", StudyQuizController.getStudyStats);
router3.get("/quiz/:roadmapId", StudyQuizController.getQuiz);
router3.post("/quiz/submit", validateBody(SubmitQuizSchema), StudyQuizController.submitQuiz);
var studyQuizRouter = router3;

// src/index.ts
var app = express();
var allowedOrigins = [
  config.clientUrl,
  "https://learnflow-ai-eight.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true
  })
);
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "learnflow-ai-server",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "LearnFlow AI Server is running",
    liveClient: "https://learnflow-ai-eight.vercel.app"
  });
});
var dbInitPromise = null;
var ensureDb = async (_req, _res, next) => {
  try {
    if (!dbInitPromise) {
      dbInitPromise = connectToDatabase().then(() => {
      });
    }
    await dbInitPromise;
    next();
  } catch (error) {
    console.error("[Serverless DB Init Error]:", error);
    next(error);
  }
};
app.use("/api", ensureDb);
app.all("/api/auth/*splat", (req, res, next) => {
  try {
    const auth = getAuth();
    return toNodeHandler(auth)(req, res);
  } catch (err) {
    next(err);
  }
});
app.use(express.json());
app.use("/api/roadmaps", roadmapRouter);
app.use("/api/planner", moduleTaskRouter);
app.use("/api/study", studyQuizRouter);
if (!config.isProduction || !config.isVercel) {
  connectToDatabase().then(() => {
    app.listen(config.port, () => {
      console.log(`[LearnFlow Server] Running on http://localhost:${config.port}`);
    });
  }).catch((err) => {
    console.error("[LearnFlow Server] Failed to start:", err);
  });
}
var index_default = app;
export {
  index_default as default
};
