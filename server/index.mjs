import { createServer } from "node:http";
import { randomUUID, createHmac, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

loadDotEnv();

const PORT = Number(process.env.API_PORT || 3001);
const DB_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || "change-me";

if (!DB_URL) {
  console.warn("[api] Missing DATABASE_URL / NEON_DATABASE_URL");
}

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.warn("[api] Missing ADMIN_EMAIL / ADMIN_PASSWORD");
}

const sql = DB_URL ? neon(DB_URL) : null;

createServer(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/api/health") {
      return json(res, 200, { ok: true });
    }

    if (url.pathname === "/api/auth/login" && req.method === "POST") {
      const body = await readJson(req);
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        return json(res, 500, { error: "Admin credentials are not configured" });
      }
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (email !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
        return json(res, 401, { error: "Invalid email or password" });
      }
      const token = signToken({ email, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 });
      return json(res, 200, { token });
    }

    if (url.pathname === "/api/auth/logout" && req.method === "POST") {
      return json(res, 200, { ok: true });
    }

    if (url.pathname === "/api/auth/session" && req.method === "GET") {
      const session = requireAuth(req);
      if (!session) return json(res, 401, { error: "Unauthorized" });
      return json(res, 200, { user: { email: session.email } });
    }

    if (url.pathname === "/api/posts" && req.method === "GET") {
      ensureDb();
      const published = url.searchParams.get("published");
      if (published === "true") {
        const rows = await sql`
          select * from posts
          where published = true
          order by created_at desc
        `;
        return json(res, 200, rows);
      }
      if (!requireAuth(req)) return json(res, 401, { error: "Unauthorized" });
      const rows = await sql`select * from posts order by created_at desc`;
      return json(res, 200, rows);
    }

    if (url.pathname.startsWith("/api/posts/") && req.method === "GET") {
      ensureDb();
      const slug = decodeURIComponent(url.pathname.slice("/api/posts/".length));
      const session = requireAuth(req);
      const rows = session
        ? await sql`select * from posts where slug = ${slug} limit 1`
        : await sql`select * from posts where slug = ${slug} and published = true limit 1`;
      return json(res, 200, rows[0] ?? null);
    }

    if (url.pathname === "/api/posts" && req.method === "POST") {
      ensureDb();
      if (!requireAuth(req)) return json(res, 401, { error: "Unauthorized" });
      const body = await readJson(req);
      const now = new Date().toISOString();
      const id = randomUUID();
      const rows = await sql`
        insert into posts (
          id, title, slug, excerpt, content, cover_image, published, created_at, updated_at, published_at, author_id
        ) values (
          ${id},
          ${String(body.title || "")},
          ${String(body.slug || "")},
          ${nullableText(body.excerpt)},
          ${String(body.content || "")},
          ${nullableText(body.cover_image)},
          ${Boolean(body.published)},
          ${now},
          ${now},
          ${body.published_at ? new Date(body.published_at).toISOString() : null},
          null
        )
        returning *
      `;
      return json(res, 201, rows[0]);
    }

    if (url.pathname.startsWith("/api/posts/") && req.method === "PATCH") {
      ensureDb();
      if (!requireAuth(req)) return json(res, 401, { error: "Unauthorized" });
      const id = decodeURIComponent(url.pathname.slice("/api/posts/".length));
      const body = await readJson(req);
      const rows = await sql`
        update posts
        set
          title = ${String(body.title || "")},
          slug = ${String(body.slug || "")},
          excerpt = ${nullableText(body.excerpt)},
          content = ${String(body.content || "")},
          cover_image = ${nullableText(body.cover_image)},
          published = ${Boolean(body.published)},
          published_at = ${body.published_at ? new Date(body.published_at).toISOString() : null},
          updated_at = now()
        where id = ${id}
        returning *
      `;
      if (!rows[0]) return json(res, 404, { error: "Post not found" });
      return json(res, 200, rows[0]);
    }

    if (url.pathname.startsWith("/api/posts/") && req.method === "DELETE") {
      ensureDb();
      if (!requireAuth(req)) return json(res, 401, { error: "Unauthorized" });
      const id = decodeURIComponent(url.pathname.slice("/api/posts/".length));
      await sql`delete from posts where id = ${id}`;
      res.writeHead(204);
      res.end();
      return;
    }

    json(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    json(res, 500, { error: error.message || "Server error" });
  }
}).listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});

function nullableText(value) {
  if (value === null || value === undefined || value === "") return null;
  return String(value);
}

function ensureDb() {
  if (!sql) throw new Error("DATABASE_URL / NEON_DATABASE_URL is not configured");
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
}

function json(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function requireAuth(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  return verifyToken(token);
}

function signToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token) {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", SESSION_SECRET).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload?.email || !payload?.exp || Date.now() > Number(payload.exp)) return null;
    return { email: String(payload.email) };
  } catch {
    return null;
  }
}

function loadDotEnv() {
  const path = ".env";
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    if (process.env[key] !== undefined) continue;
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
