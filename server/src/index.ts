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

// Allowed origins
const allowedOrigins = [
  config.clientUrl,
  "https://learnflow-ai-eight.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

// Configure CORS for Next.js client
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow during preview deployments
      }
    },
    credentials: true,
  })
);

// Health check endpoint (does not depend on database connection)
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "learnflow-ai-server",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "LearnFlow AI Server is running",
    liveClient: "https://learnflow-ai-eight.vercel.app",
  });
});

// Middleware ensuring DB connection is ready before processing API requests
let dbInitPromise: Promise<void> | null = null;
const ensureDb = async (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
  try {
    if (!dbInitPromise) {
      dbInitPromise = connectToDatabase().then(() => {});
    }
    await dbInitPromise;
    next();
  } catch (error) {
    console.error("[Serverless DB Init Error]:", error);
    next(error);
  }
};

app.use("/api", ensureDb);

// Mount Better Auth Node handler
app.all("/api/auth/*splat", (req, res, next) => {
  try {
    const auth = getAuth();
    return toNodeHandler(auth)(req, res);
  } catch (err) {
    next(err);
  }
});

// Mount JSON parser for feature API routes
app.use(express.json());

// Feature routers
app.use("/api/roadmaps", roadmapRouter);
app.use("/api/planner", moduleTaskRouter);
app.use("/api/study", studyQuizRouter);

// Start HTTP listener for local development
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  connectToDatabase()
    .then(() => {
      app.listen(config.port, () => {
        console.log(`[LearnFlow Server] Running on http://localhost:${config.port}`);
      });
    })
    .catch((err) => {
      console.error("[LearnFlow Server] Failed to start:", err);
    });
}

export default app;