import { ApiError } from "./ApiError";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);

  headers.set("Content-Type", "application/json");
  headers.set("X-Correlation-Id", "lab-request-001");

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
  });

  const correlationId = response.headers.get("X-Correlation-Id") ?? undefined;

  if (response.status === 401) {
    throw new ApiError(
      "Your session has expired. Please sign in again.",
      401,
      correlationId,
    );
  }

  if (response.status === 403) {
    throw new ApiError(
      "You do not have permission to perform this action.",
      403,
      correlationId,
    );
  }

  if (!response.ok) {
    let message = "The request could not be completed.";

    try {
      const body = await response.json();

      if (typeof body.message === "string") {
        message = body.message;
      }
    } catch {
      // Keep generic message when response isn't JSON.
    }

    throw new ApiError(message, response.status, correlationId);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
