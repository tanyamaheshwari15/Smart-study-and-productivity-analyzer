# Smart Study & Productivity Analyzer

A full-stack study management app for tracking subjects, study sessions, goals, focus, streaks, and study plans. The frontend is React + Vite; the API is Node.js + Express with MongoDB/Mongoose. Gemini can generate study analyses and plans when its API is available. If plan generation falls back to the deterministic scheduler, the plan is labeled as not AI-generated and includes the recorded reason.

## Features

- JWT registration, login, and account deletion
- MongoDB-backed subjects, sessions, goals, plans, activities, and analysis history
- User-specific dashboard analytics
- Study timer, activity log, goals, profile, settings, and study summary
- Gemini-based study analysis and planner, with transparent deterministic plan fallback
- Plan validation, acceptance, and planned/completed/missed/postponed activity tracking

## Requirements

- Node.js 20.19+ (or 22.12+) and npm
- MongoDB running locally, or a MongoDB Atlas database
- A Gemini API key is optional for running the core application; it is required for live Gemini generation

## Run locally

### 1. Get the code and install dependencies

Open a terminal in the repository root:

```powershell
cd Backend
npm install
cd ..\Frontend
npm install
cd ..
```

### 2. Configure MongoDB

For a local MongoDB server, start the MongoDB service and use:

```text
mongodb://127.0.0.1:27017/smart-study
```

Alternatively, create a database in MongoDB Atlas and use its connection string as `MONGODB_URI`. Replace the username, password, cluster host, and database name with your own values. URL-encode special characters in the username or password. Do not put database credentials in frontend files or commit them.

### 3. Create and configure the backend `.env`

Copy the example file:

```powershell
Copy-Item Backend\.env.example Backend\.env
```

Edit `Backend\.env` and set values as follows:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/smart-study
JWT_SECRET=replace_with_a_long_random_secret
FRONTEND_URL=http://localhost:5173
AI_PROVIDER=gemini
GEMINI_API_KEY=your_Gemini_API_key
GEMINI_MODEL=gemini-3.8-flash
```

Configuration notes:

| Variable | Local value / purpose |
| --- | --- |
| `PORT` | `3000` is the backend port used by the local frontend URL below. |
| `NODE_ENV` | Use `development` locally. |
| `MONGODB_URI` | Use the local URI above or your private Atlas URI. MongoDB must be reachable by the backend. |
| `JWT_SECRET` | Replace the example with a private random secret. Generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste the output. |
| `FRONTEND_URL` | `http://localhost:5173` is the Vite development origin. |
| `AI_PROVIDER` | Set to `gemini` to enable Gemini integration. |
| `GEMINI_API_KEY` | Your private key from Google AI Studio. Leave empty if you only want to run the non-Gemini parts; never expose or commit it. |
| `GEMINI_MODEL` | The model ID the backend requests. This repository’s example is `gemini-3.8-flash`; use a model available to your Google AI Studio project. |

The Gemini key and model must be configured in the **backend** `.env`, not in a `VITE_` frontend variable. Restart the backend after changing `.env`.

### 4. Configure the frontend `.env`

Copy its example:

```powershell
Copy-Item Frontend\.env.example Frontend\.env
```

For local development, set:

```env
VITE_API_URL=http://localhost:3000/api
```

Only public frontend configuration belongs in this file. Never add Gemini keys, JWT secrets, or MongoDB credentials here.

### 5. Start the backend and frontend

Open **two terminals** from the repository root.

Terminal 1 — backend:

```powershell
cd Backend
npm run dev
```

The backend should report a MongoDB connection and listen at `http://localhost:3000`.

Terminal 2 — frontend:

```powershell
cd Frontend
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). Register a user; the app’s records are scoped to that account.

### 6. Check the local API and Gemini

In a browser, visit `http://localhost:3000/api/health` to check the API process.

To test Gemini independently, from another terminal run:

```powershell
cd Backend
npm run test:gemini
```

This makes a minimal direct request to Google’s Gemini API. It does not create a plan, connect to MongoDB, or use deterministic fallback. Success prints JSON similar to:

```json
{
  "provider": "gemini",
  "model": "gemini-3.8-flash",
  "success": true,
  "response": "Gemini API connection successful."
}
```

An HTTP `429` means the Google project’s quota/rate limit has been reached; a free key does not guarantee requests are available at all times. The diagnostic reports sanitized provider errors and never prints the API key. Check Google AI Studio’s quota for the project associated with the key. A Gemini failure does not prevent the core app from running; generated plans may use the explicitly labeled deterministic scheduler.

## Validation commands

Run these from their respective directories:

```powershell
# Frontend
cd Frontend
npm run lint
npm run build

# Backend (syntax checks)
cd ..\Backend
node --check src\controllers\planController.js
node --check src\controllers\aiController.js
```

There is currently no automated backend test suite. Live Gemini results depend on network availability and the Google project’s model access and quota.

## Environment and secret safety

- `Backend/.env` and `Frontend/.env` are local-only and ignored by Git.
- Keep the `.env.example` files as templates; do not put real credentials in them.
- If an API key or secret is exposed, revoke/rotate it with its provider.
- Use a unique, long random `JWT_SECRET`; do not reuse an API key or password as the JWT secret.

## API groups

- `/api/auth/*` — registration, login, current user
- `/api/dashboard` — calculated account-specific dashboard data
- `/api/subjects/*` — subject management
- `/api/data/sessions/*` — study-session management
- `/api/data/goals/*` — goal management
- `/api/data/preferences` — saved study preferences
- `/api/ai/analyze` and `/api/ai/history` — generate and revisit study analyses
- `/api/plans/*` — generate, review, accept, and retrieve plans
- `/api/plans/activities/:id/status` — complete, postpone, or miss scheduled activities

## Deployment notes

- Use MongoDB Atlas or another secured MongoDB deployment.
- Configure backend environment variables in the deployment platform; do not upload `.env`.
- Set backend `FRONTEND_URL` to the exact deployed frontend origin.
- Set frontend `VITE_API_URL` to the deployed backend’s `/api` URL before building.
- Use HTTPS and a newly generated production `JWT_SECRET`.
- Do not assume the local Gemini quota or model access will match the production project.
