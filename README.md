# Smart Campus Lost & Found System

A full-stack web application for managing lost and found items on a university campus, featuring real-time chat, AI-assisted matching, admin analytics, and a premium dark-mode UI.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS (TypeScript), Prisma ORM, PostgreSQL, Redis |
| Auth | JWT (access + refresh tokens), bcrypt, Passport |
| Real-time | Socket.IO WebSockets |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| State | Redux Toolkit |
| DevOps | Docker, Docker Compose, Nginx |

## Features

- **Authentication** — Register/login with roles (Student, Faculty, Security, Admin), JWT with refresh rotation
- **Item Reporting** — Report lost or found items with category, location, date, tags, images
- **Smart Matching Engine** — Jaccard keyword similarity + category + location + date proximity scoring (0–100)
- **Real-time Chat** — WebSocket rooms per confirmed match, typing indicators, read receipts
- **Claims Workflow** — Submit ownership claims → admin review → transactional approval
- **Notifications** — Real-time push + persistent notification feed
- **Admin Dashboard** — Analytics (recovery rate, trends, top categories/locations), user management, chat audit, item moderation

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

### Quick Start (Docker)

```bash
# Clone the repo, then:
docker-compose up --build
```

- Frontend: http://localhost
- Backend API: https://campus-l-f.onrender.com/api
- Swagger docs: https://campus-l-f.onrender.com/api/docs

### Local Development

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your local PostgreSQL & Redis URLs
npm install
npx prisma migrate dev
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Proxies /api requests to https://campus-l-f.onrender.com
```

## Environment Variables

See `backend/.env.example` for required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection URL |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `PORT` | Backend port (default 3000) |

## API Documentation

Swagger UI is available at `/api/docs` when the backend is running.

## Project Structure

```
LF/
├── backend/               # NestJS application
│   ├── src/
│   │   ├── auth/          # JWT auth, strategies, guards
│   │   ├── users/         # Profile management
│   │   ├── items/         # Lost/found items CRUD
│   │   ├── matching/      # Intelligent matching engine
│   │   ├── chat/          # WebSocket gateway + chat service
│   │   ├── claims/        # Claims workflow
│   │   ├── notifications/ # Real-time notifications
│   │   ├── admin/         # Admin analytics & moderation
│   │   ├── prisma/        # Database service
│   │   └── common/        # Shared guards, decorators, filters
│   └── prisma/
│       └── schema.prisma  # Database schema
├── frontend/              # React application
│   └── src/
│       ├── api/           # Axios client with auto token refresh
│       ├── components/    # Layout, Auth components
│       ├── pages/         # All 18 page components
│       └── store/         # Redux store + authSlice
├── docker-compose.yml     # Full stack deployment
└── README.md
```

## Matching Algorithm

The matching engine uses a weighted scoring algorithm:

| Factor | Weight |
|--------|--------|
| Category match | 30 pts |
| Keyword overlap (Jaccard) | 40 pts |
| Same location | 20 pts |
| Date proximity | 10 pts |

Matches above 40% are automatically created and users/admins are notified.
