import { ApiRequestError } from "@/lib/api-client";
import type { ApiError, User } from "@/types/api";
import type { LoginInput, RegisterInput } from "./schemas";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiRequestError(data as ApiError);
  }

  return data as T;
}

export function login(input: LoginInput) {
  return postJson<{ user: User }>("/api/auth/login", input);
}

export function register(input: RegisterInput) {
  return postJson<{ user: User }>("/api/auth/register", input);
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}
