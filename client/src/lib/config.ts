/**
 * Centralized, secure environment configuration for the client.
 * Prevents direct process.env leaks and ensures consistent sanitization across components.
 */

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL;
const RAW_AUTH_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

const sanitizeUrl = (url?: string, defaultUrl: string = ""): string => {
  if (!url) return defaultUrl;
  return url.endsWith("/") ? url.slice(0, -1) : url;
};

export const clientConfig = {
  apiUrl: sanitizeUrl(
    RAW_API_URL,
    "https://learnflow-ai-server-ecru.vercel.app"
  ),
  authUrl: sanitizeUrl(
    RAW_AUTH_URL,
    "https://learnflow-ai-server-ecru.vercel.app"
  ),
} as const;
