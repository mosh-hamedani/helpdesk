# Helpdesk

> This project is built as part of my [Claude Code](https://codewithmosh.com/p/claude-code) course, showing how to build and ship a production-ready full-stack app with AI-assisted development.

An AI-powered ticket management system that automatically classifies, responds to, and routes support tickets.

## Features

- Receive support emails and create tickets via SendGrid inbound parse
- AI-powered ticket classification (General Question, Technical Question, Refund Request)
- AI-suggested replies and summaries
- Ticket list with filtering and sorting
- Ticket detail view with reply thread
- User management (admin only)
- Dashboard with stats

## Tech Stack

- **Frontend**: React, TypeScript, Vite, shadcn/ui, TanStack Query
- **Backend**: Express 5, TypeScript, Bun
- **Database**: PostgreSQL, Prisma ORM
- **AI**: OpenAI GPT via Vercel AI SDK
- **Auth**: Better Auth (email/password, database sessions)
- **Job Queue**: pg-boss
- **Error Tracking**: Sentry
- **Email**: SendGrid (inbound + outbound)

## Project Structure

```
client/   - React frontend (Vite)
server/   - Express backend
core/     - Shared code (Zod schemas, types, constants)
e2e/      - Playwright E2E tests
```

## Prerequisites

- [Bun](https://bun.sh) (runtime and package manager)
- PostgreSQL

## Getting Started

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Set up environment variables**

   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

   Edit `server/.env` and fill in the required values. At minimum:
   - `DATABASE_URL` - PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - generate with `openssl rand -base64 32`
   - `OPENAI_API_KEY` - for AI features

3. **Set up the database**

   ```bash
   cd server
   bunx prisma migrate dev
   bunx prisma db seed
   ```

4. **Start the dev servers**

   ```bash
   # Terminal 1 - backend
   cd server && bun run dev

   # Terminal 2 - frontend
   cd client && bun run dev
   ```

   The client runs on `http://localhost:5173` and proxies API requests to the server on port 3000.

## Testing

```bash
# Component tests
cd client && bun run test

# E2E tests (requires both servers running)
bun run test:e2e
```

## Deployment (Railway)

The app is configured for single-service deployment on Railway. The Express server serves the built React client as static files in production.

1. **Build the Docker image**

   ```bash
   docker build -t helpdesk .
   ```

2. **Run locally with Docker**

   ```bash
   docker run -p 3000:3000 --env-file server/.env -e NODE_ENV=production helpdesk
   ```

3. **Deploy to Railway**

   - Create a new project and link this repo
   - Add a PostgreSQL database
   - Set the required environment variables (see `server/.env.example`)
   - After the first deploy, seed the database:
     ```bash
     railway run -- bun run --cwd server prisma db seed
     ```

### Required Environment Variables (Production)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (auto-provided by Railway) |
| `BETTER_AUTH_SECRET` | Auth secret key |
| `BETTER_AUTH_URL` | App URL (e.g. `https://yourapp.up.railway.app`) |
| `TRUSTED_ORIGINS` | Same as `BETTER_AUTH_URL` |
| `WEBHOOK_SECRET` | For inbound email webhook verification |
| `OPENAI_API_KEY` | OpenAI API key for AI features |
| `SENDGRID_API_KEY` | SendGrid API key for outbound email |
| `SENDGRID_FROM_EMAIL` | Verified sender email address |
| `SEED_ADMIN_EMAIL` | Initial admin user email |
| `SEED_ADMIN_PASSWORD` | Initial admin user password |

Optional: `SENTRY_DSN`, `SENTRY_ENVIRONMENT`
