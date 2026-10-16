import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { ModuleTaskController } from "../controllers/moduleTaskController";
import {
  CreateModuleSchema,
  CreateTaskSchema,
  UpdateTaskStatusSchema,
} from "../validations/schemas";

const router = Router();

// Protect all module & task routes
router.use(requireAuth);

// Module Endpoints
router.post("/modules", validateBody(CreateModuleSchema), ModuleTaskController.createModule);
router.get("/modules/roadmap/:roadmapId", ModuleTaskController.getModulesByRoadmap);
router.delete("/modules/:id", ModuleTaskController.deleteModule);

// Task Endpoints
router.post("/tasks", validateBody(CreateTaskSchema), ModuleTaskController.createTask);
router.patch("/tasks/:id/status", validateBody(UpdateTaskStatusSchema), ModuleTaskController.updateTaskStatus);
router.delete("/tasks/:id", ModuleTaskController.deleteTask);

export const moduleTaskRouter = router;
