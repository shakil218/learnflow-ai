import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { config } from "./config/env";
import { connectToDatabase } from "./db/connection";
import { getAuth } from "./auth/auth";
import { roadmapRouter } from "./routes/roadmapRoutes";
import { moduleTaskRouter } from "./routes/moduleTaskRoutes";
import { studyQuizRouter } from "./routes/studyQuizRoutes";

const app = express();

// Configure CORS for Next.js client
app.use(
  cors({
    origin: [
      config.clientUrl,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  })
);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "learnflow-ai-server",
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  try {
    // 1. Connect to MongoDB Atlas
    await connectToDatabase();

    // 2. Initialize Better Auth
    const auth = getAuth();

    // 3. Mount Better Auth Node handler
    app.all("/api/auth/*splat", toNodeHandler(auth));

    // 4. Mount JSON parser for regular API routes
    app.use(express.json());

    // 5. Mount feature routers
    app.use("/api/roadmaps", roadmapRouter);
    app.use("/api/planner", moduleTaskRouter);
    app.use("/api/study", studyQuizRouter);

    // 6. Start HTTP listener
    app.listen(config.port, () => {
      console.log(`[LearnFlow Server] Running on http://localhost:${config.port}`);
      console.log(`[LearnFlow Server] Auth endpoint mounted at /api/auth`);
    });
  } catch (error) {
    console.error("[LearnFlow Server] Failed to start:", error);
    process.exit(1);
  }
}

startServer();

export default app;