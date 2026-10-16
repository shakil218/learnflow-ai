import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`[Security Alert] Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  isProduction: process.env.NODE_ENV === "production",
  isVercel: Boolean(process.env.VERCEL),
  port: Number(getEnv("PORT", "5000")),
  mongodbUri: getEnv(
    "MONGODB_URI",
    "mongodb://localhost:27017/learnflow_ai"
  ),
  dbName: getEnv("DB_NAME", "learnflow_ai"),
  betterAuthSecret: getEnv(
    "BETTER_AUTH_SECRET",
    "default_learnflow_development_secret_key_32chars"
  ),
  betterAuthUrl: getEnv(
    "BETTER_AUTH_URL",
    "https://learnflow-ai-server-ecru.vercel.app"
  ),
  clientUrl: getEnv(
    "CLIENT_URL",
    "https://learnflow-ai-eight.vercel.app"
  ),
} as const;

export type AppConfig = typeof config;
