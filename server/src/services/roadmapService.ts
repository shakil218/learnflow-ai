import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";
import { COLLECTIONS } from "../db/collections";
import { IRoadmap, IModule, ITask } from "../types/models";
import { CreateRoadmapInput, UpdateRoadmapInput } from "../validations/schemas";
import { calculateRoadmapProgress } from "./progressLogic";

export class RoadmapService {
  private static getCollection() {
    return getDatabase().collection<IRoadmap>(COLLECTIONS.ROADMAPS);
  }

  private static getModulesCollection() {
    return getDatabase().collection<IModule>(COLLECTIONS.MODULES);
  }

  private static getTasksCollection() {
    return getDatabase().collection<ITask>(COLLECTIONS.TASKS);
  }

  static async createRoadmap(userId: string, data: CreateRoadmapInput): Promise<IRoadmap> {
    const roadmap: IRoadmap = {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.getCollection().insertOne(roadmap as any);
    return { ...roadmap, _id: result.insertedId };
  }

  static async getRoadmapsByUser(userId: string): Promise<IRoadmap[]> {
    return this.getCollection()
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();
  }

  static async getRoadmapById(id: string, userId: string): Promise<IRoadmap | null> {
    if (!ObjectId.isValid(id)) return null;
    return this.getCollection().findOne({ _id: new ObjectId(id), userId });
  }

  static async updateRoadmap(
    id: string,
    userId: string,
    update: UpdateRoadmapInput
  ): Promise<IRoadmap | null> {
    if (!ObjectId.isValid(id)) return null;

    const fieldsToUpdate: Partial<IRoadmap> = {
      updatedAt: new Date(),
    };

    if (update.title !== undefined) fieldsToUpdate.title = update.title.trim();
    if (update.description !== undefined) fieldsToUpdate.description = update.description.trim();
    if (update.targetHoursPerWeek !== undefined) fieldsToUpdate.targetHoursPerWeek = update.targetHoursPerWeek;
    if (update.difficulty !== undefined) fieldsToUpdate.difficulty = update.difficulty;
    if (update.status !== undefined) fieldsToUpdate.status = update.status;

    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id), userId },
      { $set: fieldsToUpdate },
      { returnDocument: "after" }
    );

    return result ?? null;
  }

  static async deleteRoadmap(id: string, userId: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const roadmapObjectId = new ObjectId(id);

    // Delete tasks, modules, and the roadmap itself
    await this.getTasksCollection().deleteMany({ roadmapId: roadmapObjectId, userId });
    await this.getModulesCollection().deleteMany({ roadmapId: roadmapObjectId, userId });
    const deleteResult = await this.getCollection().deleteOne({ _id: roadmapObjectId, userId });

    return deleteResult.deletedCount > 0;
  }

  static async syncRoadmapProgress(roadmapId: string, userId: string): Promise<IRoadmap | null> {
    if (!ObjectId.isValid(roadmapId)) return null;
    const rId = new ObjectId(roadmapId);

    const tasks = await this.getTasksCollection().find({ roadmapId: rId, userId }).toArray();
    const progressSummary = calculateRoadmapProgress(tasks);

    const status =
      progressSummary.progressPercentage === 100
        ? "completed"
        : progressSummary.progressPercentage > 0
        ? "in_progress"
        : "in_progress";

    const updated = await this.getCollection().findOneAndUpdate(
      { _id: rId, userId },
      {
        $set: {
          progressPercentage: progressSummary.progressPercentage,
          totalEstimatedMinutes: progressSummary.totalEstimatedMinutes,
          completedMinutes: progressSummary.completedMinutes,
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return updated ?? null;
  }
}
