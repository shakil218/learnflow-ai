import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { RoadmapController } from "../controllers/roadmapController";
import {
  CreateRoadmapSchema,
  UpdateRoadmapSchema,
  GenerateAiRoadmapSchema,
} from "../validations/schemas";

const router = Router();

// Protect all roadmap routes
router.use(requireAuth);

router.get("/", RoadmapController.getAll);
router.get("/:id", RoadmapController.getById);
router.post("/", validateBody(CreateRoadmapSchema), RoadmapController.create);
router.post("/ai/generate", validateBody(GenerateAiRoadmapSchema), RoadmapController.generateWithAi);
router.put("/:id", validateBody(UpdateRoadmapSchema), RoadmapController.update);
router.delete("/:id", RoadmapController.delete);

export const roadmapRouter = router;
