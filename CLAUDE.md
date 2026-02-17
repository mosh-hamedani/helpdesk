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
/core     - Shared code (Zod schemas, types) — Bun workspace package
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
- Organize server endpoints into Express `Router` modules under `server/src/routes/` (e.g. `routes/users.ts`), mounted in `index.ts`
- Define shared Zod schemas in the `core` package under `core/schemas/` (e.g. `core/schemas/users.ts`) and import them in both client and server (e.g. `import { createUserSchema } from "core/schemas/users"`)
- Use Zod for validation (import from `zod/v4`)
- Do not wrap async route handlers in try/catch — Express 5 automatically catches rejected promises
- Use Prisma-generated enums (e.g. `Role`) instead of hardcoded strings (import from `./generated/prisma/enums`)
- Use React Hook Form with Zod resolver for client-side form validation (`useForm` + `zodResolver` from `@hookform/resolvers/zod`)
- Use Axios for HTTP requests (not `fetch`)
- Use TanStack React Query (`useQuery`, `useMutation`) for server state management (not `useEffect` + `useState`)

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

## Testing

### Component Tests
- **Framework**: Vitest + React Testing Library
- Run with `cd client && bun run test` (single run) or `bun run test:watch` (watch mode)
- Place test files next to the component: `ComponentName.test.tsx`
- Use `renderWithQuery` from `@/test/render` to wrap components that use TanStack React Query
- Mock Axios with `vi.mock("axios")` and `vi.mocked(axios, { deep: true })`

### E2E Tests
- **Framework**: Playwright
- Use the `e2e-test-writer` agent for writing Playwright E2E tests
- Run with `bun run test:e2e` from root
