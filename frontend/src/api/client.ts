const BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Array<{ path: string; message: string }>;
}

class ApiRequestError extends Error {
  status: number;
  code: string;
  details?: ApiError["details"];

  constructor(status: number, code: string, details?: ApiError["details"]) {
    super(`API Error: ${code}`);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export { ApiRequestError };

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = body?.error;
    throw new ApiRequestError(
      res.status,
      err?.code ?? "UNKNOWN",
      err?.details,
    );
  }

  return res.json() as Promise<T>;
};

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
