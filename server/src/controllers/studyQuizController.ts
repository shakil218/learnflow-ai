import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth";
import { StudyLogService } from "../services/studyLogService";
import { AiQuizService } from "../services/aiQuizService";
import { RoadmapService } from "../services/roadmapService";
import { CreateStudyLogInput, SubmitQuizInput } from "../validations/schemas";
import { getDatabase } from "../db/connection";
import { COLLECTIONS } from "../db/collections";
import { ObjectId } from "mongodb";
import { IQuizAttempt } from "../types/models";

export class StudyQuizController {
  static async logStudySession(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = req.body as CreateStudyLogInput;

      const log = await StudyLogService.logStudySession(userId, input);
      res.status(201).json({ success: true, data: log });
    } catch (error) {
      console.error("[StudyQuizController.logStudySession] Error:", error);
      res.status(500).json({ success: false, message: "Failed to record study session" });
    }
  }

  static async getStudyStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const stats = await StudyLogService.getUserStudyStats(userId);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("[StudyQuizController.getStudyStats] Error:", error);
      res.status(500).json({ success: false, message: "Failed to calculate study statistics" });
    }
  }

  static async getQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { roadmapId } = req.params;

      const roadmap = await RoadmapService.getRoadmapById(roadmapId, userId);
      if (!roadmap) {
        res.status(404).json({ success: false, message: "Roadmap not found" });
        return;
      }

      const questions = AiQuizService.generateQuizQuestions(roadmap.topic);
      // Strip correct answers before sending to client for honest assessment
      const clientQuestions = questions.map((q) => ({
        id: q.id,
        question: q.question,
        options: q.options,
      }));

      res.json({
        success: true,
        data: {
          roadmapTitle: roadmap.title,
          topic: roadmap.topic,
          questions: clientQuestions,
        },
      });
    } catch (error) {
      console.error("[StudyQuizController.getQuiz] Error:", error);
      res.status(500).json({ success: false, message: "Failed to load quiz" });
    }
  }

  static async submitQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = req.body as SubmitQuizInput;

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
          explanation: question ? question.explanation : "",
        };
      });

      const score = Math.round((correctCount / fullQuestions.length) * 100);
      const passed = score >= 75;

      const attemptRecord: IQuizAttempt = {
        userId,
        roadmapId: new ObjectId(input.roadmapId),
        moduleId: input.moduleId ? new ObjectId(input.moduleId) : undefined,
        score,
        totalQuestions: fullQuestions.length,
        passed,
        answers: gradedAnswers,
        createdAt: new Date(),
      };

      await getDatabase().collection(COLLECTIONS.QUIZ_ATTEMPTS).insertOne(attemptRecord as any);

      res.json({
        success: true,
        data: {
          score,
          correctCount,
          totalQuestions: fullQuestions.length,
          passed,
          gradedAnswers,
        },
      });
    } catch (error) {
      console.error("[StudyQuizController.submitQuiz] Error:", error);
      res.status(500).json({ success: false, message: "Failed to evaluate quiz" });
    }
  }
}
