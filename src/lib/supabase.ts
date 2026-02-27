import { apiFetch } from "@/lib/api";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  author_id: string | null;
};

export async function getPosts(publishedOnly = true) {
  const query = new URLSearchParams();
  if (publishedOnly) query.set("published", "true");
  return apiFetch<Post[]>(`/api/posts${query.toString() ? `?${query}` : ""}`);
}

export async function getPost(slug: string) {
  return apiFetch<Post | null>(`/api/posts/${encodeURIComponent(slug)}`);
}

export async function createPost(post: Partial<Post>) {
  return apiFetch<Post>("/api/posts", {
    method: "POST",
    body: JSON.stringify(post),
  });
}

export async function updatePost(id: string, post: Partial<Post>) {
  return apiFetch<Post>(`/api/posts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(post),
  });
}

export async function deletePost(id: string) {
  await apiFetch<void>(`/api/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 80);
}
