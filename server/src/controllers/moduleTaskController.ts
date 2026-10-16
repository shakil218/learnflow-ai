import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { ModuleTaskService } from "../services/moduleTaskService";
import { CreateModuleInput, CreateTaskInput, UpdateTaskStatusInput } from "../validations/schemas";

export class ModuleTaskController {
  static async createModule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = req.body as CreateModuleInput;

      const mod = await ModuleTaskService.createModule(userId, input);
      res.status(201).json({ success: true, data: mod });
    } catch (error) {
      console.error("[ModuleTaskController.createModule] Error:", error);
      res.status(500).json({ success: false, message: "Failed to create module" });
    }
  }

  static async getModulesByRoadmap(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { roadmapId } = req.params;

      const modules = await ModuleTaskService.getModulesByRoadmap(roadmapId, userId);
      res.json({ success: true, data: modules });
    } catch (error) {
      console.error("[ModuleTaskController.getModulesByRoadmap] Error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch modules" });
    }
  }

  static async deleteModule(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

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
  static async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = req.body as CreateTaskInput;

      const task = await ModuleTaskService.createTask(userId, input);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      console.error("[ModuleTaskController.createTask] Error:", error);
      res.status(500).json({ success: false, message: "Failed to create task" });
    }
  }

  static async updateTaskStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const input = req.body as UpdateTaskStatusInput;

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

  static async deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

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
}
