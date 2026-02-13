****# Helpdesk - AI-Powered Ticket Management System

## Project Overview

A ticket management system that uses AI to classify, respond to, and route support tickets. See `project-scope.md` for full requirements and `implementation-plan.md` for phased task breakdown.

## Tech Stack

- **Frontend**: React + TypeScript + Vite (port 5173) + shadcn/ui
- **Backend**: Express + TypeScript + Bun (port 3000)
- **Database**: PostgreSQL with Prisma ORM
- **AI**: Claude API (Anthropic)
- **Auth**: Better Auth (email/password, database sessions)

## Project Structure

```
/client   - React frontend (Vite)
/server   - Express backend
/e2e      - Playwright E2E tests
```

## Development

```bash
# Start server
cd server && bun run dev

# Start client
cd client && bun run dev
```

The client proxies `/api/*` requests to the server via Vite config (target is configurable via `VITE_API_URL` env var, defaults to `http://localhost:3000`).

## Key Conventions

- Use Bun as the runtime and package manager (not npm/yarn)
- Use TypeScript throughout
- Use context7 MCP server to fetch up-to-date documentation for libraries
- Use shadcn/ui components for all UI (import from `@/components/ui/*`)
- Use the `@/` path alias for imports (maps to `./src/`)
- Use shadcn's semantic color tokens (e.g. `bg-background`, `text-muted-foreground`, `text-destructive`) instead of hardcoded Tailwind colors

## Authentication

- **Library**: Better Auth with Prisma adapter
- **Server config**: `server/src/lib/auth.ts` — mounted at `/api/auth/{*any}` (must be before `express.json()`)
- **Client config**: `client/src/lib/auth-client.ts` — exports `signIn`, `signOut`, `useSession`
- **Middleware**: `server/src/middleware/require-auth.ts` — `requireAuth` guard that sets `req.user` and `req.session`
- **Route protection (client)**: `ProtectedRoute` component wraps authenticated routes; redirects to `/login` if unauthenticated
- **Admin route protection (client)**: `AdminRoute` component wraps admin-only routes; redirects non-admins to `/`
- **Sign-up is disabled** — users are seeded via `prisma/seed.ts`
- **User roles**: `admin` and `agent` (defined as Prisma enum, default `agent`)
- **Rate limiting**: Auth routes are rate-limited, but only enforced when `NODE_ENV=production`

## E2E Testing

- **Framework**: Playwright (config at root `playwright.config.ts`)
- **Test database**: `helpdesk_test` (isolated from dev `helpdesk` DB), configured in `server/.env.test`
- **Ports**: Test server on 3001, test client on 5174 (dev uses 3000/5173)
- **Global setup** (`e2e/global-setup.ts`): Runs `prisma migrate reset --force` then seeds the test DB
- **Tests directory**: `e2e/tests/`
- **Run tests**: `bun run test:e2e` from root (also `test:e2e:ui`, `test:e2e:headed`)
