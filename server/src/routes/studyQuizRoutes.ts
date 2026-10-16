import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { validateBody } from "../middlewares/validate";
import { StudyQuizController } from "../controllers/studyQuizController";
import { CreateStudyLogSchema, SubmitQuizSchema } from "../validations/schemas";

const router = Router();

// Protect all study & quiz routes
router.use(requireAuth);

router.post("/logs", validateBody(CreateStudyLogSchema), StudyQuizController.logStudySession);
router.get("/stats", StudyQuizController.getStudyStats);

router.get("/quiz/:roadmapId", StudyQuizController.getQuiz);
router.post("/quiz/submit", validateBody(SubmitQuizSchema), StudyQuizController.submitQuiz);

export const studyQuizRouter = router;
