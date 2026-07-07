# DOST Situation Reporting — README

This repository contains the DOST Situation Reporting dashboard: a React-based frontend and a Node.js backend with PostgreSQL. The project supports local development (dev servers), test suites, and a Docker-based production deployment.

---

## 🧭 Overview

- Frontend: React (Create React App), served in development by `react-scripts` and in production by static build files.
- Backend: Express server (`server.js`) exposing `/api` routes for offices, events, users, notifications, and typhoon history.
- Database: PostgreSQL (local or managed), initialized by the backend on startup if necessary.
- Sync: a lightweight `syncService` polls the backend and updates the UI automatically (near real-time updates).

---

## 🚀 Local Development

Prerequisites:
- Node.js (>=16), npm
- PostgreSQL (local Docker container recommended)

1. Install dependencies:

```bash
npm install
```

2. Development environment variables

Create a `.env` file in the project root (not checked into git) when you need to customize ports or DB settings. Example variables used by this repo:

- `PORT` — backend server port (default: `5010` when running via `npm run dev`).
- `REACT_APP_API_PORT` — frontend dev server proxy target port (default: `5010`).
- `DATABASE_URL` or specific DB variables used by the backend (see `server.js` / environment reading).

3. Start the app (frontend + backend):

```bash
npm run dev
```

This runs the Express backend on port `5010` and the React dev server on `5006` (see `package.json` scripts). If ports are occupied, kill the stale processes or update the env vars.

4. Optional public preview with Ngrok

If you want a public URL for the frontend, add your Ngrok auth token to your shell or `.env` file:

```bash
export NGROK_AUTHTOKEN=your_token_here
```

Then start the tunnel for the local app:

```bash
npm run ngrok
```

or directly:

```bash
ngrok http 5006 --host-header=localhost:5006
```

Important:
- do not run `ngrok http` with no port, because that defaults to `localhost:80`
- do not use `ngrok http 80` unless your app is actually served on port 80

The correct target for this project is `5006`, which is the CRA dev server port.

If you still see `Invalid Host header`, stop any existing ngrok tunnels and restart it:

```bash
pkill -f ngrok || true
npm run ngrok
```

If you want to use Docker Compose with Ngrok instead, make sure the frontend is exposed on the same port that Ngrok forwards.

4. Useful commands

- Run tests (CI mode):

```bash
CI=true npx react-scripts test --watchAll=false --runInBand
```

- Build production bundle:

```bash
npm run build
```

---

## 🗄️ Database

- The backend uses PostgreSQL. For local development you can run Postgres in Docker:

```bash
docker run --name dost-postgres -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=dost -e POSTGRES_DB=dost -p 5432:5432 -d postgres:15
```

- The backend (`server.js`) will attempt to create tables and a default admin user on startup. If you use managed Postgres (Aiven, etc.), ensure your `DATABASE_URL` or connection env vars are set and correct.

Common issues:
- `EADDRINUSE` / ports: kill stale dev processes (`fuser -k 5010/tcp`), or change `PORT`.
- SSL errors / host mismatch: ensure the backend DB config does not force SSL for localhost development.

---

## ⚙️ Key Files

- `src/components/Dashboard.jsx` — main dashboard container and state management.
- `src/components/dashboard/DashboardSections.jsx` — history UI, parsing and totals logic.
- `src/services/syncService.js` — background polling/sync that updates UI state automatically.
- `server.js` — Express API and DB initialization.
- `src/services/dbService.js` — frontend API wrapper used by the app.

---

## 🔁 Auto-update / Sync Behavior

- The app runs a background sync (`syncService`) that polls the server every ~10 seconds (configurable) and pushes/pulls data. This keeps the UI in near-real-time sync with the backend, including typhoon history updates.
- When an event is deployed via the UI, the app archives the previous active event into history and then resets PSTO office state for the newly active event (this reset is intentional for deployed events only).

---

## 🧩 Event and PSTO behavior

- Creating a new event (Draft or Pending) does not reset PSTO office data — the current office summaries remain intact.
- Deploying an event (clicking Deploy) archives the previous active event into history and resets PSTO office data for the new active event. This behavior is implemented in `src/components/Dashboard.jsx` (`handleDeployEvent` + `resetPSTODataForNewEvent`).

If you'd like different behavior (e.g., preserve images or municipalities when deploying), open an issue or request which fields to preserve.

---

## 🐛 Troubleshooting

- Frontend won't start / port in use:
	- Kill stale jobs: `fuser -k 5006/tcp && fuser -k 5010/tcp` or change ports in `.env`.
- Backend DB connection issues:
	- Verify `DATABASE_URL` and host/port. For local Postgres use host `localhost` and disable forced SSL.
- Tests failing:
	- Run `CI=true npx react-scripts test --watchAll=false --runInBand` to reproduce the CI run locally.

---

## 🛳️ Production (Docker Compose)

1. Create `.env` with production DB credentials and any overrides.
2. Build and start:

```bash
docker-compose build
docker-compose up -d
```

3. Check logs:

```bash
docker-compose logs -f
```

---

## ✅ Contributing

1. Create a feature branch
2. Implement and run tests
3. Open a pull request with a clear description

---

