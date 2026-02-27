# Fullstack Auth Module (React + NestJS + MongoDB)

## Overview

This project implements a production-ready authentication module with a React frontend and a NestJS backend.

It supports:

* User signup with validation
* User signin with JWT authentication
* Protected routes
* Secure password hashing
* API documentation via Swagger
* Rate limiting and structured logging

---

## Tech Stack

### Frontend

* React (Vite + TypeScript)
* React Router
* React Hook Form + Zod
* Tailwind CSS

### Backend

* NestJS (TypeScript)
* MongoDB (Mongoose)
* JWT (Authentication)
* Argon2 (Password hashing)
* Swagger (API documentation)
* Pino (Structured logging)
* Throttler (Rate limiting)

---

## Architecture

* Frontend and backend are separated for clarity and scalability.
* Backend exposes a REST API consumed by the frontend.
* Authentication is stateless using JWT.
* Validation is shared conceptually between frontend (Zod) and backend (class-validator + custom logic).

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd easygen-task
```

---

### 2. Start MongoDB (Docker)

```bash
docker compose up -d
```

---

### 3. Run Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Backend runs at:

```
http://localhost:3001
```

---

### 4. Run Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## API Documentation

Swagger is available at:

```
http://localhost:3001/docs
```

You can:

1. Sign up a user
2. Sign in
3. Copy the JWT token
4. Authorize via Swagger
5. Call protected endpoints

---

## Authentication Flow

1. User signs up → password is hashed with Argon2
2. User signs in → receives JWT access token
3. Token is stored in localStorage (frontend)
4. Protected routes call `/auth/me` to validate session
5. Invalid/expired tokens trigger logout

---

## Security Considerations

* Passwords are hashed using Argon2
* Sensitive fields are redacted from logs
* Rate limiting is applied to authentication endpoints
* JWT expiration is enforced
* Input validation is enforced on both frontend and backend

---

## Testing

### Run backend tests

```bash
cd backend
npm run test
npm run test:e2e
```

* E2E tests use an in-memory MongoDB instance
* Covers signup, signin, and protected routes

---

## Logging

* Structured logging using Pino
* Request IDs added for traceability
* Auth events (success/failure) are logged safely

---

## CI

GitHub Actions pipeline runs:

* Linting
* Unit tests
* E2E tests
* Frontend build

---

## Possible Improvements

* Refresh token implementation
* HTTP-only cookie authentication
* Deployment (Dockerized full stack)
