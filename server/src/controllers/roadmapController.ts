import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { RoadmapService } from "../services/roadmapService";
import { ModuleTaskService } from "../services/moduleTaskService";
import { AiCurriculumService } from "../services/aiCurriculumService";
import { CreateRoadmapInput, UpdateRoadmapInput, GenerateAiRoadmapInput } from "../validations/schemas";

export class RoadmapController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const roadmaps = await RoadmapService.getRoadmapsByUser(userId);
      res.json({ success: true, data: roadmaps });
    } catch (error) {
      console.error("[RoadmapController.getAll] Error:", error);
      res.status(500).json({ success: false, message: "Failed to retrieve roadmaps" });
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

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
          tasks,
        },
      });
    } catch (error) {
      console.error("[RoadmapController.getById] Error:", error);
      res.status(500).json({ success: false, message: "Failed to load roadmap details" });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = req.body as CreateRoadmapInput;

      const roadmap = await RoadmapService.createRoadmap(userId, input);
      res.status(201).json({ success: true, data: roadmap });
    } catch (error) {
      console.error("[RoadmapController.create] Error:", error);
      res.status(500).json({ success: false, message: "Failed to create roadmap" });
    }
  }

  static async generateWithAi(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = req.body as GenerateAiRoadmapInput;

      // 1. Generate blueprint with AI service
      const blueprint = AiCurriculumService.generateCurriculum(input);

      // 2. Persist the Roadmap entity
      const roadmap = await RoadmapService.createRoadmap(userId, {
        title: blueprint.title,
        topic: blueprint.topic,
        description: blueprint.description,
        targetHoursPerWeek: blueprint.targetHoursPerWeek,
        difficulty: blueprint.difficulty,
      });

      const roadmapIdStr = roadmap._id!.toString();

      // 3. Persist the generated modules and tasks
      for (const modBlueprint of blueprint.modules) {
        const createdModule = await ModuleTaskService.createModule(userId, {
          roadmapId: roadmapIdStr,
          title: modBlueprint.title,
          summary: modBlueprint.summary,
          order: modBlueprint.order,
          estimatedMinutes: modBlueprint.estimatedMinutes,
        });

        const moduleIdStr = createdModule._id!.toString();
        for (const taskBlueprint of modBlueprint.tasks) {
          await ModuleTaskService.createTask(userId, {
            roadmapId: roadmapIdStr,
            moduleId: moduleIdStr,
            title: taskBlueprint.title,
            description: taskBlueprint.description,
            estimatedMinutes: taskBlueprint.estimatedMinutes,
            order: taskBlueprint.order,
          });
        }
      }

      // 4. Sync initial progress
      const finalRoadmap = await RoadmapService.syncRoadmapProgress(roadmapIdStr, userId);

      res.status(201).json({
        success: true,
        message: "AI Roadmap generated successfully",
        data: finalRoadmap,
      });
    } catch (error) {
      console.error("[RoadmapController.generateWithAi] Error:", error);
      res.status(500).json({ success: false, message: "Failed to generate AI roadmap" });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const input = req.body as UpdateRoadmapInput;

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

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

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
}
