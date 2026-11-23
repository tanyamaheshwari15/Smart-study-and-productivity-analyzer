# Smart Study & Productivity Analyzer

A full-stack MERN application for tracking study sessions, goals, focus, streaks, and adaptive study recommendations.

## Features

- JWT authentication and account deletion
- MongoDB study-session and goal CRUD
- Real dashboard analytics from the signed-in user's sessions
- Functional Pomodoro-style study timer
- Gemini AI integration using real account data, with a real-data fallback when Gemini is unavailable
- Adaptive topic review plan
- Activity log, profile, settings, leaderboard, and study insights

## Run locally

### Backend

```bash
cd Backend
npm install
cp .env.example .env
```

Set `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, and optionally `GEMINI_API_KEY`. Start MongoDB locally or use MongoDB Atlas.

```bash
npm start
```

API: `http://localhost:5000/api`

### Frontend

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL=http://localhost:5000/api` for local development.

## Gemini AI

Set:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-3.8-flash
```

The backend sends only MongoDB-derived study statistics for the authenticated user. If Gemini is not configured or fails, the application returns an adaptive plan calculated from real session and goal data.

## Production deployment

- Deploy the backend to Render/Railway/Azure and set all `.env` variables.
- Deploy `Frontend/dist` to Vercel/Netlify, or serve it from Express/static hosting.
- Set `VITE_API_URL` to the deployed backend `/api` URL before building.
- Set `FRONTEND_URL` to the exact deployed frontend origin.
- Use a MongoDB Atlas database and a strong random `JWT_SECRET`.
- Never commit `.env` or API keys.

## Test

```bash
cd Frontend
npm run build

cd ../Backend
npm start
curl http://localhost:5000/api/health
```
