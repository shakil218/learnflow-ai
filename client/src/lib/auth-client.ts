import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
    "https://learnflow-ai-server-ecru.vercel.app",
});

export const { signIn, signUp, signOut, useSession } = authClient;
