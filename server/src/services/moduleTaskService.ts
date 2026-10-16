import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";
import { COLLECTIONS } from "../db/collections";
import { IModule, ITask } from "../types/models";
import { CreateModuleInput, CreateTaskInput, UpdateTaskStatusInput } from "../validations/schemas";
import { RoadmapService } from "./roadmapService";

export class ModuleTaskService {
  private static getModulesCollection() {
    return getDatabase().collection<IModule>(COLLECTIONS.MODULES);
  }

  private static getTasksCollection() {
    return getDatabase().collection<ITask>(COLLECTIONS.TASKS);
  }

  // --- MODULE OPERATIONS ---
  static async createModule(userId: string, data: CreateModuleInput): Promise<IModule> {
    const roadmapId = new ObjectId(data.roadmapId);
    const newModule: IModule = {
      roadmapId,
      userId,
      title: data.title.trim(),
      summary: data.summary?.trim() ?? "",
      order: data.order,
      estimatedMinutes: data.estimatedMinutes,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.getModulesCollection().insertOne(newModule as any);
    return { ...newModule, _id: result.insertedId };
  }

  static async getModulesByRoadmap(roadmapId: string, userId: string): Promise<IModule[]> {
    if (!ObjectId.isValid(roadmapId)) return [];
    return this.getModulesCollection()
      .find({ roadmapId: new ObjectId(roadmapId), userId })
      .sort({ order: 1 })
      .toArray();
  }

  static async deleteModule(moduleId: string, userId: string): Promise<boolean> {
    if (!ObjectId.isValid(moduleId)) return false;
    const mId = new ObjectId(moduleId);

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
  static async createTask(userId: string, data: CreateTaskInput): Promise<ITask> {
    const roadmapId = new ObjectId(data.roadmapId);
    const moduleId = new ObjectId(data.moduleId);

    const newTask: ITask = {
      roadmapId,
      moduleId,
      userId,
      title: data.title.trim(),
      description: data.description?.trim() ?? "",
      status: "pending",
      order: data.order,
      estimatedMinutes: data.estimatedMinutes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.getTasksCollection().insertOne(newTask as any);
    await RoadmapService.syncRoadmapProgress(data.roadmapId, userId);

    return { ...newTask, _id: result.insertedId };
  }

  static async getTasksByModule(moduleId: string, userId: string): Promise<ITask[]> {
    if (!ObjectId.isValid(moduleId)) return [];
    return this.getTasksCollection()
      .find({ moduleId: new ObjectId(moduleId), userId })
      .sort({ order: 1 })
      .toArray();
  }

  static async getTasksByRoadmap(roadmapId: string, userId: string): Promise<ITask[]> {
    if (!ObjectId.isValid(roadmapId)) return [];
    return this.getTasksCollection()
      .find({ roadmapId: new ObjectId(roadmapId), userId })
      .sort({ order: 1 })
      .toArray();
  }

  static async updateTaskStatus(
    taskId: string,
    userId: string,
    input: UpdateTaskStatusInput
  ): Promise<ITask | null> {
    if (!ObjectId.isValid(taskId)) return null;
    const tId = new ObjectId(taskId);

    const currentTask = await this.getTasksCollection().findOne({ _id: tId, userId });
    if (!currentTask) return null;

    const completedAt = input.status === "completed" ? new Date() : undefined;

    const updatedTask = await this.getTasksCollection().findOneAndUpdate(
      { _id: tId, userId },
      {
        $set: {
          status: input.status,
          completedAt,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (updatedTask) {
      await RoadmapService.syncRoadmapProgress(updatedTask.roadmapId.toString(), userId);
    }

    return updatedTask ?? null;
  }

  static async deleteTask(taskId: string, userId: string): Promise<boolean> {
    if (!ObjectId.isValid(taskId)) return false;
    const tId = new ObjectId(taskId);

    const task = await this.getTasksCollection().findOne({ _id: tId, userId });
    if (!task) return false;

    const result = await this.getTasksCollection().deleteOne({ _id: tId, userId });
    if (result.deletedCount > 0) {
      await RoadmapService.syncRoadmapProgress(task.roadmapId.toString(), userId);
      return true;
    }
    return false;
  }
}
