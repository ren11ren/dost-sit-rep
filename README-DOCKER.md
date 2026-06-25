# Docker Configuration for DOST Region 1 Disaster Management Dashboard (`dost-sit-rep`)

This project has been Dockerized to support easy deployment and consistent development environments. You can run the application in either **Development Mode** (with hot-reloading) or **Production Mode** (with built assets served via Nginx).

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

---

## 🚀 Quick Start (Development Mode)

Development mode maps your local project folder into the container, allowing changes to `src/` and other files to trigger hot-reloading immediately.

1.  Navigate to the project folder:
    ```bash
    cd dost-sit-rep
    ```
2.  Start the containers:
    ```bash
    docker-compose up --build
    ```
3.  Access the applications:
    *   **Frontend (React App):** `http://localhost:3000`
    *   **Postgres API Backend:** `http://localhost:5001/api`
    *   **In-Memory API Backend:** `http://localhost:5005/api`

*To stop the containers, press `Ctrl+C` or run:*
```bash
docker-compose down
```

---

## 🌐 Production Mode (Nginx + Express Node API)

Production mode compiles the React assets into a highly optimized static build and serves them via Nginx. The Nginx server also acts as a reverse proxy, forwarding requests on `/api` to the backend Express API.

1.  Build and start the production stack:
    ```bash
    docker-compose -f docker-compose.prod.yml up --build -d
    ```
2.  Access the applications:
    *   **Frontend (Nginx static web server):** `http://localhost` (Port 80)
    *   **Postgres API Backend:** `http://localhost:5001/api`
    *   **In-Memory API Backend:** `http://localhost:5005/api`

*To stop the production containers:*
```bash
docker-compose -f docker-compose.prod.yml down
```

---

## 🛠️ Configuration & Database Setup

The backend utilizes cloud-hosted databases by default:
*   **PostgreSQL Database (Aiven or compatible):** Configured via `.env` and consumed by `server.js`.
*   **MySQL Database (Aiven):** Used by `src/services/database.js` when that service is enabled.

### Environment Variables
For PostgreSQL connectivity (Aiven recommended), ensure you have a valid `.env` file in the root of the `dost-sit-rep` folder:
```env
DATABASE_URL=postgres://username:password@your-pg-host.aivencloud.com:port/defaultdb?sslmode=require

# Optional split variables (used when DATABASE_URL is not set)
PGHOST=your-pg-host.aivencloud.com
PGPORT=port
PGUSER=username
PGPASSWORD=your_password
PGDATABASE=defaultdb

# Server port
PORT=5001
```

### Switching Backend Servers (Dev Compose)
By default, the development configuration runs the Postgres-backed `server.js`. If you would like to run the simple mock in-memory server instead:
1.  Open `docker-compose.yml`.
2.  Locate the `command` line under the `backend` service.
3.  Change it from `command: node server.js` to `command: node simple-server.js`.
4.  Re-run `docker-compose up --build`.

---

## 🔍 Troubleshooting & Docker Tips

### Port Mismatch / Port Already In Use
If ports `3000`, `5001`, `5005`, or `80` are already in use on your host machine, you can change the left-side port mapping in `docker-compose.yml` or `docker-compose.prod.yml` to redirect to another port (e.g., `"3001:3000"` to access the frontend on port 3001).

### Reinstalling Dependencies
If you update `package.json` and need to rebuild the containers with the latest libraries, run:
```bash
docker-compose build --no-cache
```

### Checking Logs
To view logs for all services or specific services:
```bash
# All logs
docker-compose logs -f

# Backend logs only
docker-compose logs -f backend
```
