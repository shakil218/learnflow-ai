import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT ?? 5000),
  mongodbUri:
    process.env.MONGODB_URI ??
    "mongodb://localhost:27017/learnflow_ai",
  dbName: process.env.DB_NAME ?? "learnflow_ai",
  betterAuthSecret:
    process.env.BETTER_AUTH_SECRET ?? "default_learnflow_development_secret_key_32chars",
  betterAuthUrl:
    process.env.BETTER_AUTH_URL ??
    "https://learnflow-ai-server-ecru.vercel.app",
  clientUrl:
    process.env.CLIENT_URL ?? "https://learnflow-ai-eight.vercel.app",
};
