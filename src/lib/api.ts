import { auth } from "@/lib/auth";
import { toApiUrl } from "@/lib/api-url";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers || {});
  const token = auth.getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(toApiUrl(path), { ...init, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}
