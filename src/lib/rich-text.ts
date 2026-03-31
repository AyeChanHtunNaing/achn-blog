export function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function looksLikeHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

export function plainTextToHtml(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return "<p></p>";

  return trimmed
    .split(/\n\s*\n/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function normalizeRichTextContent(content: string | null | undefined) {
  const value = content || "";
  if (!value.trim()) return "<p></p>";
  return looksLikeHtml(value) ? value : plainTextToHtml(value);
}
