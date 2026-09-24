# PawanBlog Event Ticket App Source Code

This is the backend and frontend source code for the PawanBlog event ticket app build.

The source code is provided as-is.

## Running locally

Requirements: Docker Desktop (running), Java 21, Node 22.

```bash
# 1. Postgres (5433), Adminer (8889), Keycloak (9090)
cd backend
docker compose up -d

# 2. Backend API on http://localhost:8081
./mvnw spring-boot:run

# 3. Frontend on http://localhost:5173 (new terminal)
cd frontend
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:5173.

### Logins

| Where | Username | Password | Role |
|---|---|---|---|
| Keycloak admin (http://localhost:9090) | `admin` | `admin` | admin |
| App | `organizer` | `password` | `ROLE_ORGANIZER` – create/publish events |
| App | `attendee` | `password` | `ROLE_ATTENDEE` – buy tickets |
| App | `staff` | `password` | `ROLE_STAFF` – validate tickets (`/dashboard/validate-qr`) |

New users can sign up on the Keycloak login page and get `ROLE_ATTENDEE` by default.

On a fresh Keycloak volume, `backend/keycloak/event-ticket-platform-realm.json` is imported
automatically (realm, client, roles and users).
