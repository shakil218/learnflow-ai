import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDatabase } from "../db/connection";
import { config } from "../config/env";

export const getAuth = () => {
  const db = getDatabase();

  return betterAuth({
    database: mongodbAdapter(db),
    secret: config.betterAuthSecret,
    baseURL: config.betterAuthUrl,
    trustedOrigins: [
      config.clientUrl,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
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
