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
```

## Development

```bash
# Start server
cd server && bun run dev

# Start client
cd client && bun run dev
```

The client proxies `/api/*` requests to the server via Vite config.

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
