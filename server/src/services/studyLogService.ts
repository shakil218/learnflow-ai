import { ObjectId } from "mongodb";
import { getDatabase } from "../db/connection";
import { COLLECTIONS } from "../db/collections";
import { IStudyLog } from "../types/models";
import { CreateStudyLogInput } from "../validations/schemas";
import { calculateStudyStreak } from "./progressLogic";

export class StudyLogService {
  private static getCollection() {
    return getDatabase().collection<IStudyLog>(COLLECTIONS.STUDY_LOGS);
  }

  static async logStudySession(userId: string, input: CreateStudyLogInput): Promise<IStudyLog> {
    const todayStr = new Date().toISOString().split("T")[0];
    const logDate = input.loggedDate ?? todayStr;

    const newLog: IStudyLog = {
      userId,
      roadmapId: new ObjectId(input.roadmapId),
      moduleId: input.moduleId ? new ObjectId(input.moduleId) : undefined,
      minutesSpent: input.minutesSpent,
      notes: input.notes?.trim() ?? "",
      loggedDate: logDate,
      createdAt: new Date(),
    };

    const result = await this.getCollection().insertOne(newLog as any);
    return { ...newLog, _id: result.insertedId };
  }

  static async getUserLogs(userId: string): Promise<IStudyLog[]> {
    return this.getCollection()
      .find({ userId })
      .sort({ loggedDate: -1, createdAt: -1 })
      .toArray();
  }

  static async getUserStudyStats(userId: string): Promise<{
    totalMinutesLogged: number;
    currentStreak: number;
    totalStudyDays: number;
  }> {
    const logs = await this.getCollection().find({ userId }).toArray();
    const totalMinutesLogged = logs.reduce((acc, log) => acc + (log.minutesSpent || 0), 0);
    const dateStrings = logs.map((log) => log.loggedDate);

    const { currentStreak, totalStudyDays } = calculateStudyStreak(dateStrings);

    return {
      totalMinutesLogged,
      currentStreak,
      totalStudyDays,
    };
  }
}
