# Online_Vet

PawCare: a veterinary practice site with a landing page and account authentication.

## Structure

- `frontend/` — React + Vite + TypeScript app (landing page at `/`, login at `/login`, register at `/register`)
- `backend/` — Express + MySQL API

## Running locally

```bash
# Backend (requires MySQL; see backend/.env.example)
cd backend
cp .env.example .env   # fill in DB credentials
npm run db:schema      # applies backend/db/schema.sql
npm run dev            # http://localhost:3000

# Frontend
cd frontend
npm install
npm run dev            # http://localhost:5173 (proxies /api to :3000)
```

## Auth

- `POST /api/auth/register` — create an account (first_name, last_name, email, password); returns a JWT and logs the user in
- `POST /api/auth/login` — email + password; returns the user and a JWT
- `GET /api/auth/me` — restore the session from a `Bearer` token
- `POST /api/auth/logout` — stateless; the client discards its token

Passwords are hashed with scrypt (Node's `crypto`). Tokens are signed with `JWT_SECRET` (set a long random value in production) and expire after `JWT_EXPIRES_IN` (default `7d`).

Google sign-in on the register page is UI-only for now; it will be wired up to Clerk.