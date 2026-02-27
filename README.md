# My Blog

Personal blog app built with React, Vite, Tailwind CSS, and Neon (Postgres).

## Local development

```sh
npm install
cp .env.example .env
```

Start API + frontend together:

```sh
npm run dev:all
```

Or run them separately:

```sh
npm run api:dev
npm run dev
```

The frontend runs on `http://localhost:8080` and proxies `/api/*` to the local API on `http://localhost:3001`.

## Neon setup

Set these values in `.env`:

```sh
NEON_DATABASE_URL=postgres://...
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your-password
SESSION_SECRET=long-random-string
```

Create the database schema in Neon using:

```sh
server/sql/neon-schema.sql
```

## Scripts

- `npm run dev:all` - start API + frontend together
- `npm run api:dev` - start local API server
- `npm run dev` - start frontend dev server
- `npm run build` - production build
- `npm run preview` - preview the built app
- `npm run test` - run tests
- `npm run lint` - run ESLint

## Stack

- React + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Neon Postgres
