import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { getDatabase, getMongoClient } from "../db/connection";
import { config } from "../config/env";

export const getAuth = () => {
  const db = getDatabase();
  const client = getMongoClient();

  return betterAuth({
    database: mongodbAdapter(db, {
      client,
    }),
    secret: config.betterAuthSecret,
    baseURL: config.betterAuthUrl,
    trustedOrigins: [
      config.clientUrl,
      "https://learnflow-ai-eight.vercel.app",
      "https://learnflow-phahay3gm-shakils-projects-ddb9ccb7.vercel.app",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    advanced: {
      useSecureCookies: config.isProduction,
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        partitioned: true,
      },
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 6,
    },
    user: {
      additionalFields: {
        bio: {
          type: "string",
          required: false,
        },
      },
    },
  });
};
