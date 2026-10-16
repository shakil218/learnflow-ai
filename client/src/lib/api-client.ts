import { clientConfig } from "./config";

interface FetchOptions extends RequestInit {
  data?: unknown;
}

export async function apiClient<T>(
  endpoint: string,
  { data, headers: customHeaders, ...customConfig }: FetchOptions = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${clientConfig.apiUrl}${cleanEndpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(customHeaders as Record<string, string>),
  };

  const config: RequestInit = {
    method: data ? "POST" : "GET",
    headers,
    credentials: "include", // Essential for Better Auth cookie session propagation
    ...customConfig,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      responseData?.message ?? `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return responseData;
}
