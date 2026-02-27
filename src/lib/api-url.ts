const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

export function toApiUrl(path: string) {
  if (!path.startsWith("/")) return path;
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}
