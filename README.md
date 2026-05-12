# FounIT JO

Production-ready monorepo for a lost & found platform:
- **Frontend**: Next.js (App Router) in `frontend/` (deploy to **Vercel**)
- **Backend**: Express + Socket.IO + MongoDB in `backend/` (deploy to **Render**)

## Architecture

- Frontend uses `NEXT_PUBLIC_API_URL` for REST and Socket.IO connections.
- Backend exposes REST APIs, WebSocket events, auth, and `/healthz` for health checks.
- Backend enforces CORS via `CORS_ORIGINS`/`FRONTEND_URL`.

## Repository Structure

```text
founIT/
├── frontend/     # Next.js app (Vercel)
├── backend/      # Express API + Socket.IO (Render)
├── render.yaml   # Render service blueprint
└── .env.example  # Combined env reference
```

## Package Manager

This repo uses **npm** (`package-lock.json` is present in both apps).

## Environment Variables

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

### Backend (`backend/.env`)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=mongodb+srv://<user>:<pass>@<cluster>/<db>
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=https://your-vercel-app.vercel.app
CORS_ORIGINS=https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://your-render-backend.onrender.com/auth/google/callback
```

> You can also start from the root `.env.example`.

## Local Development

Install dependencies:

```bash
cd frontend && npm ci
cd ../backend && npm ci
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

## Build & Validation

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
npm test   # currently placeholder script
npm start
```

Health check:

```bash
GET /healthz
```

## Deploy to Vercel (Frontend)

1. Import repository in Vercel.
2. Set **Root Directory** to `frontend`.
3. Add env var:
   - `NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com`
4. Deploy.

`frontend/vercel.json` is included with build/install commands and security headers.

## Deploy to Render (Backend)

### Option A (Recommended): Blueprint

1. In Render, create service from this repo using `render.yaml`.
2. Ensure env vars are filled (all `sync: false` values).
3. Deploy and verify:
   - `https://<service>.onrender.com/healthz`

### Option B: Manual Web Service

- Root directory: `backend`
- Build command: `npm ci`
- Start command: `npm start`
- Health check path: `/healthz`

## Production Notes

- No production localhost API fallbacks are used.
- Frontend will fail API calls if `NEXT_PUBLIC_API_URL` is missing.
- Backend exits in production when CORS origins are not configured.
- Security headers are configured in Next.js and Vercel.
- Logging is structured and production-safe in touched backend services.

