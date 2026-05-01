import { apiFetch } from "@/lib/api";
import { ApiError } from "@/types/type";

export const apiBase = process.env.NEXT_PUBLIC_API_BASE;

export const apiRequest = async <T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await apiFetch(`${apiBase}${path}`, {
    ...options,
    headers,
  });

  const data = (await response.json().catch(() => ({}))) as ApiError;

  if (!response.ok) {
    const validationMessage = data.errors
      ?.map((error) => error.message)
      .filter(Boolean)
      .join(", ");

    throw new Error(validationMessage || data.message || "Request failed");
  }

  return data as T;
};
