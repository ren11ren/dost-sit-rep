# DOST SIT REP (Production)

This repository contains the source code for the DOST Situation Reporting system, structured with a React frontend and a Node.js backend. The deployment is fully containerized using Docker and managed via Docker Compose.

---

## 🛠️ Tech Stack
* **Frontend:** React (Vite), Nginx (Production reverse proxy)
* **Backend:** Node.js API
* **Deployment:** Docker & Docker Compose

---

## 🚀 Getting Started (Production Deployment)

### Prerequisites
Make sure you have Docker and Docker Compose installed on your hosting environment.

### 1. Environment Configuration
Before spinning up the containers, you must create a `.env` file in the root directory of the project to securely pass your production database credentials.

```bash
touch .env
