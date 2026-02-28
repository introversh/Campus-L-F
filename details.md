# Project: LF (Lost & Found System)

A full-stack, real-time application designed to help students and faculty report lost items and find found ones through an automated matching engine.

## 🚀 Tech Stack

### Backend (NestJS)
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with **Prisma ORM**
- **Authentication**: JWT (Access + Refresh Tokens) with serialized refresh logic.
- **Real-time**: Socket.io for chat and notifications.
- **Security**: 
  - Role-Based Access Control (RBAC): `STUDENT`, `FACULTY`, `ADMIN`, `SECURITY`.
  - Rate limiting on auth endpoints.
  - Helmet for security headers.
  - Input validation via `class-validator`.

### Frontend (React)
- **Library**: React 18
- **State Management**: Redux Toolkit (thunks for async logic).
- **Routing**: React Router 6 (with specialized `ProtectedRoute` and `AdminRoute`).
- **Styling**: Modern "Glassmorphic" CSS system with dark mode and premium aesthetics.
- **Icons**: Lucide React.
- **API Client**: Axios with interceptors for token auto-refresh and 429 error handling.

---

## 🛠️ Core Features

### 1. Item Management
- **Reporting**: Detailed forms for Lost/Found items including category, location (building/floor), and images.
- **Browsing**: Public and user-specific item listings with multi-status filtering (`ACTIVE`, `MATCHED`, `CLAIMED`, `CLOSED`).

### 2. Intelligent Matching Engine
- **Scoring Algorithm**: Uses a multi-factor weighting system:
  - Category match (30 pts)
  - Text similarity via Jaccard index (40 pts)
  - Location/Building proximity (20 pts)
  - Date proximity (10 pts)
- **Top-5 Cap**: Automatically caps potential matches at the top 5 candidates per item to ensure high signal-to-noise ratio.

### 3. Claim & Review Workflow
- **Submission**: Users can submit claims for found items with a descriptive justification.
- **Admin Review**: Admins/Security can approve or reject claims. 
- **Auto-Update**: Approving a claim automatically marks the item as `CLAIMED` and closes any associated matches.

### 4. Real-time Communication
- **Chat Rooms**: Created automatically when a match is confirmed or a claim is approved.
- **Live Notifications**: Real-time push notifications for matches, claim status updates, and new messages.

---

## 🏗️ Architectural Highlights

- **Auth Integrity**: Frontend `ProtectedRoute` and `AdminRoute` verify both token presence and server-side user data population before rendering.
- **Token Resilience**: The Axios interceptor uses a shared promise to prevent "race condition" refresh failures when multiple API calls expire simultaneously.
- **Data Consistency**: Backend uses Prisma transactions for critical operations like claim approval to ensure atomicity across items, claims, and chat rooms.
- **Optimistic UI**: Notifications system utilizes optimistic updates with automatic rollback on server failure to maintain snappiness.

---

## 📂 Project Structure

```text
/backend
  ├── prisma/          # Schema and migrations
  ├── src/
  │   ├── auth/        # JWT, Login, Register, Refresh
  │   ├── items/       # Item reporting and management
  │   ├── matching/    # The scoring engine
  │   ├── claims/      # Claim lifecycle and admin reviews
  │   ├── chat/        # WebSocket gateways and room management
  │   └── notifications/
/frontend
  ├── src/
  │   ├── api/         # Axios config and interceptors
  │   ├── store/       # Redux slices (auth, items, etc.)
  │   ├── components/  # Reusable UI (Layout, ProtectedRoute)
  │   └── pages/       # feature-specific views
```
