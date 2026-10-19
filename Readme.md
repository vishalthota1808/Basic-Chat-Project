# Whispr

A focused, real-time, one-to-one private messaging app. Express + PostgreSQL + WebSocket backend, Next.js frontend.

## Stack

| Layer | Tech |
| --- | --- |
| Backend | Express 5, `ws`, PostgreSQL (`pg`), JWT, Argon2 |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4, SWR |

## Project structure

```
src/            Express API + WebSocket server
  index.ts      routes, auth, ticket system, WS handling
  db.ts         PostgreSQL pool
frontend/       Next.js app (runs on port 3001)
  app/          routes (login, register, chat)
  components/   auth, chat, and UI components
  hooks/        SWR data hooks and socket subscriptions
  lib/          API clients, realtime socket, session store
```

## Prerequisites

- Node.js 20+
- PostgreSQL running locally with a database named `chat-project`

Required tables:

```sql
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE TABLE messages (
  id          SERIAL PRIMARY KEY,
  sender_id   INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Setup

**1. Backend** (repo root)

```bash
npm install
```

Create a `.env` file:

```env
POSTGRES_PASSWORD=your_postgres_password
JWT_SECRET=a_long_random_string
PORT=3000
CORS_ORIGIN=http://localhost:3001
```

**2. Frontend**

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_USE_MOCK_CHAT=false
```

Set either mock flag to `true` to run the UI without a backend.

## Run

```bash
# terminal 1 — API on :3000
npm run dev

# terminal 2 — UI on :3001
cd frontend
npm run dev
```

Open http://localhost:3001, register two accounts (e.g. in a normal and an incognito window), and chat.

## API

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | — | Create an account |
| `POST` | `/login` | — | Get a JWT |
| `GET` | `/users` | Bearer | List other users |
| `GET` | `/messages/:userId` | Bearer | Conversation history |
| `POST` | `/ws-ticket` | Bearer | Short-lived single-use WS ticket |
| `WS` | `/ws?ticket=...` | ticket | Real-time message exchange |
| `GET` | `/health` | — | Health check |

Browsers cannot set `Authorization` headers on a WebSocket handshake, so the client fetches a 30-second, single-use ticket from `POST /ws-ticket` and passes it as a query parameter. Non-browser clients may instead send a `Bearer` token in the upgrade request.

## Notes

- The UI uses a monochrome, Vercel/Cursor-inspired design system; authentication is username + password only.
- Sessions are stored in `sessionStorage` and cleared when the tab closes.
- `frontend/next.config.mjs` disables the Next.js dev indicator so it stays out of the UI.
