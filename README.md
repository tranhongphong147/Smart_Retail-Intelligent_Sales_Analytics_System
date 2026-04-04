# Smart Retail – Intelligent Sales Analytics System (SR-IAS)

## Project Overview

**Smart Retail – Intelligent Sales Analytics System (SR-IAS)** is an AI-assisted decision support platform for SMEs. It helps teams analyze sales performance, monitor inventory, and generate actionable recommendations.

- **Architecture:** MVC (Model-View-Controller), monolithic structure
- **Timeline:** 2026-01-27 to 2026-05-11
- **Primary Goal:** Provide practical insights for revenue optimization and inventory planning

## Technology Stack

The project follows this required stack:

- **Frontend:** ReactJS, TailwindCSS
- **Backend:** Node.js, ExpressJS (RESTful APIs)
- **Database:** MySQL 8.0
- **AI Engine:** Python (Regression, Time Series Forecasting)
- **Chatbot:** LLM integration (OpenAI/Gemini API)

## Current Local Development Setup

This repository is Dockerized with 3 services:

1. **frontend** (React dev server)
2. **backend** (Express API)
3. **mysql** (MySQL database with auto schema initialization)

## Run with Docker

### 1) Start all services

```bash
docker compose up --build -d
```

### 2) Verify services

```bash
docker compose ps
```

### 3) Check logs

```bash
docker compose logs -f frontend backend mysql
```

### 4) Stop services

```bash
docker compose down
```

### 5) Stop and remove DB volume (reset database)

```bash
docker compose down -v
```

## Service Endpoints

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8081
- **Backend health check:** http://localhost:8081/health
- **MySQL:** localhost:3306

## MySQL Credentials (Local Dev)

Configured in `docker-compose.yml`:

- **Database:** `smart_retail`
- **User:** `sr_user`
- **Password:** `sr_password`
- **Root password:** `rootpassword`

## Database Initialization, Migration, and Seeding

### A) Automatic init on first Docker startup

When MySQL starts with an empty volume, Docker executes SQL files in:

- `database/init/001_init_schema.sql`
- `database/init/002_seed_core_data.sql`

This provides baseline schema + seed data automatically.

```bash
docker compose up --build -d
```

If you need to re-run automatic init scripts, reset volume first:

```bash
docker compose down -v
docker compose up --build -d
```

---

### B) Manual migration/seeding via backend scripts

Manual scripts are useful when you want controlled schema/data updates without resetting Docker volumes.

#### SQL sources
- Migrations: `database/migrations/*.sql`
- Seeders: `database/seeders/*.sql`

Current files:
- `database/migrations/001_create_core_tables.sql`
- `database/seeders/001_seed_core_data.sql`

#### Run commands
From `backend/` directory:

```bash
npm run migrate
npm run seed
```

Execution behavior:
- Files are executed in lexicographical order
- Migration runner applies all `.sql` files under `database/migrations`
- Seeder runner applies all `.sql` files under `database/seeders`

---

### C) Recommended workflow for team

1. Start services:

```bash
docker compose up -d
```

2. Apply latest migrations:

```bash
cd backend
npm run migrate
```

3. Apply seed data:

```bash
npm run seed
```

4. Return to repo root (optional):

```bash
cd ..
```

---

### D) Seeder data scope (current)

`001_seed_core_data.sql` currently includes:
- Users: `admin`, `manager01`, `staff01`
- Products: `SKU-A`, `SKU-B`, `SKU-C`
- Inventory rows for each product
- Sample orders + order_items

This is enough for baseline API smoke testing and demo responses.

---

### E) Important notes

- Auto init scripts (`database/init`) run only with empty MySQL volume.
- Manual `migrate/seed` scripts can be re-run without deleting volume.
- For deterministic full reset in local dev, prefer:

```bash
docker compose down -v
docker compose up --build -d
```

## Backend API Status (Implemented)

### Health & Dashboard
- `GET /health`
- `GET /api/v1/dashboard/summary`

### Data Management
- `POST /api/v1/data/upload`  
  Current status: skeleton is implemented (file presence validation + service hook). Full CSV/Excel transactional import is in progress.

### Analytics
- `GET /api/v1/analytics/revenue`
- `GET /api/v1/analytics/inventory`

### AI & Recommendations
- `GET /api/v1/ai/forecast`
- `GET /api/v1/ai/recommendations`

### Chatbot
- `POST /api/v1/chatbot/ask`

## Sprint Plan

- **Sprint 1 (Week 1-2):** Environment setup, DB schema, data import
- **Sprint 2 (Week 3-4):** Revenue analytics + baseline forecasting model
- **Sprint 3 (Week 5-6):** Recommendations module, chatbot, dashboard integration
- **Sprint 4 (Week 7-8):** End-to-end testing, bug fixes, packaging

## Non-Functional Requirements (NFRs)

- **Performance:** Analytics and AI recommendations response time ≤ 5 seconds
- **Usability:** Simple and intuitive UI for non-technical business users
- **Security:** Authentication and business data protection

## Current Repository Structure

```text
.
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       └── server.js
├── database/
│   └── init/
│       └── 001_init_schema.sql
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
├── docker-compose.yml
└── README.md
```

## Next Implementation Steps

1. Connect backend to MySQL using a proper DB client/ORM
2. Implement all required REST endpoints under `/api/v1`
3. Add auth and role-based access (`admin`, `manager`, `staff`)
4. Add AI microservice integration (Python) for forecasting and recommendations
5. Build dashboard UI with TailwindCSS and real API data
