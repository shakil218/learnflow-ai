import { createAuthClient } from "better-auth/react";
import { clientConfig } from "./config";

export const authClient = createAuthClient({
  baseURL: clientConfig.authUrl,
});

export const { signIn, signUp, signOut, useSession } = authClient;
