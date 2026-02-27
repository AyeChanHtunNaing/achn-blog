# achn-blog

Personal blog app with:
- React + Vite frontend
- Node API server (`server/index.mjs`)
- Neon Postgres database
- Admin login via API env credentials

## Architecture

- Frontend calls `/api/*`.
- Local dev uses Vite proxy (`localhost:8080` -> `localhost:3001`).
- Production frontend (Netlify) calls deployed API using `VITE_API_BASE_URL`.
- API server uses `NEON_DATABASE_URL` to read/write posts.

## 1) Local Setup

```sh
npm install
cp .env.example .env
```

Fill `.env`:

```env
NEON_DATABASE_URL=postgresql://...
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your-strong-password
SESSION_SECRET=long-random-secret
API_PORT=3001
VITE_API_BASE_URL=
ALLOWED_ORIGINS=http://localhost:8080
```

Notes:
- Keep `VITE_API_BASE_URL` empty in local dev.
- Do not commit `.env`.

## 2) Neon Database Schema

Run this SQL in Neon:

- `server/sql/neon-schema.sql`

This creates the `posts` table and update trigger.

## 3) Run Locally

One command:

```sh
npm run dev:all
```

Or separately:

```sh
npm run api:dev
npm run dev
```

Verify API:

```sh
curl http://localhost:3001/api/health
```

Expected:

```json
{"ok":true}
```

## 4) Deploy API (Render)

Create a Render Web Service from this repo.

Settings:
- Runtime: Node
- Build Command: `npm install`
- Start Command: `node server/index.mjs`

Render env vars:

```env
NEON_DATABASE_URL=postgresql://...
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your-strong-password
SESSION_SECRET=long-random-secret
ALLOWED_ORIGINS=https://your-netlify-site.netlify.app,https://your-custom-domain.com,http://localhost:8080
```

After deploy, verify:

```sh
curl -i https://<your-render-domain>/api/health
```

## 5) Deploy Frontend (Netlify)

This repo already includes:
- `netlify.toml`
- `public/_redirects`

Netlify env var:

```env
VITE_API_BASE_URL=https://<your-render-domain>
```

Important:
- `VITE_API_BASE_URL` must be API root only.
- Correct: `https://achn-blog.onrender.com`
- Wrong: `https://achn-blog.onrender.com/api`

## 6) CORS Rules (Important)

If browser shows CORS error:
- Make sure frontend origin is in API `ALLOWED_ORIGINS`.
- Example when using custom domain:

```env
ALLOWED_ORIGINS=https://blog.peacechan.dev,https://achn-blog.netlify.app,http://localhost:8080
```

Then redeploy API.

Verify response header:

```sh
curl -i -H "Origin: https://blog.peacechan.dev" https://<your-render-domain>/api/health
```

Must include:

```http
Access-Control-Allow-Origin: https://blog.peacechan.dev
```

## 7) Admin Login

Use credentials from API environment:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Login page:
- `/login`

Admin page:
- `/admin`

## Scripts

- `npm run dev:all` start API + frontend together
- `npm run api:dev` start API only
- `npm run dev` start frontend only
- `npm run build` build frontend
- `npm run preview` preview frontend build
- `npm run lint` run eslint
- `npm run test` run tests
