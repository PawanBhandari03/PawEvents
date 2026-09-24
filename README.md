# PawEvents

A full-stack event ticketing platform built with Spring Boot and React. Organizers publish events and sell tickets, attendees buy tickets and get a QR code, and door staff scan tickets at the entrance.

---

## Features

- Login and sign-up with Keycloak (OAuth2 / OpenID Connect)
- Role-based access: attendee, organizer and door staff, each seeing only what they can do
- Event creation and management, with drafts, ticket types, capacities and sales windows
- Ticket purchase with a unique QR code per ticket
- QR code and manual ticket validation, with double-entry protection
- Event search
- Light, dark and system themes
- Responsive design for phones and desktops

---

## Tech Stack

### Backend
- Java 21
- Spring Boot 3
- Spring Security (OAuth2 resource server, JWT)
- Spring Data JPA
- PostgreSQL
- MapStruct, Lombok, ZXing (QR codes)
- Maven

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- react-oidc-context

### Infrastructure
- Keycloak (identity and roles)
- Docker Compose

---

## Project Structure

```
PawEvents
│
├── backend
│   ├── src
│   ├── keycloak          # realm imported on first start
│   ├── docker-compose.yml
│   └── pom.xml
│
├── frontend
│   ├── src
│   └── package.json
│
└── README.md
```

---

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

On a fresh Keycloak volume, `backend/keycloak/event-ticket-platform-realm.json` is imported automatically (realm, client, roles and users).

### Logins

| Where | Username | Password | Role |
|---|---|---|---|
| Keycloak admin (http://localhost:9090) | `admin` | `admin` | admin |
| App | `organizer` | `password` | `ROLE_ORGANIZER`: create, edit and publish events |
| App | `attendee` | `password` | `ROLE_ATTENDEE`: buy tickets, show QR codes |
| App | `staff` | `password` | `ROLE_STAFF`: check tickets in at the door |

Guests can browse events and sign up. New accounts get `ROLE_ATTENDEE`.

---

## API Overview

| Endpoint | Who |
|---|---|
| `GET /api/v1/published-events`, `GET /api/v1/published-events/{id}` | Everyone |
| `POST /api/v1/events/{eventId}/ticket-types/{ticketTypeId}/tickets` | Attendee |
| `GET /api/v1/tickets`, `GET /api/v1/tickets/{id}`, `GET /api/v1/tickets/{id}/qr-codes` | Attendee |
| `GET/POST /api/v1/events`, `GET/PUT/DELETE /api/v1/events/{id}` | Organizer |
| `POST /api/v1/ticket-validations` | Door staff |

---

## Screenshots

| Event page | Checkout |
|---|---|
| ![Event page](docs/screenshots/event.png) | ![Checkout](docs/screenshots/checkout.png) |

| Ticket (dark theme) | Door check-in (dark theme) |
|---|---|
| ![Ticket with QR code](docs/screenshots/ticket-dark.png) | ![Staff check-in](docs/screenshots/check-in-dark.png) |

<img src="docs/screenshots/mobile.png" alt="Event page on a phone" width="260" />

---

## Future Improvements

- Payment gateway integration
- Email notifications
- Event categories
- Analytics dashboard
- Mobile application
- Event reviews and ratings

---

## Author

Pawan Bhandari

---

## License

MIT. See the `LICENSE` files in `backend/` and `frontend/`.
