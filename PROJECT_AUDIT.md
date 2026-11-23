# PROJECT_AUDIT

Audit date: 2026-11-23

## Scope

This audit inspected the React/Vite frontend, Express/Mongoose backend, routes, middleware, models, MongoDB integration, Gemini integration, existing mock files, and build/health behavior.

## Verified working functionality

- The frontend production build completes successfully.
- The Express backend health endpoint is reachable on port 5000.
- MongoDB connection configuration exists and the backend has been observed connecting to local MongoDB in earlier runtime checks.
- Registration, login, password hashing, JWT issuance, and JWT-protected routes exist.
- Study sessions and goals are saved through MongoDB-backed endpoints.
- The dashboard queries MongoDB records by `userId` and does not seed demo sessions for new accounts.
- Session deletion and goal create/update/delete endpoints exist and filter by authenticated user ID.
- Profile update and confirmed account deletion endpoints exist.
- The frontend timer is a real local timer and can save completed elapsed time to MongoDB.
- The Gemini controller is genuine HTTP integration code: it sends MongoDB-derived records to Gemini and validates/returns JSON when the provider is configured.
- The application has a data-rule fallback for Gemini outages or missing credentials.

## UI that is genuinely connected

- Login and registration call `/api/auth/*` and store JWT/user state locally.
- Dashboard calls `/api/dashboard` and renders database-derived study/distraction, topic, heatmap, and profile values.
- Study timer calls `/api/data/sessions`.
- Activity log calls `/api/dashboard` and lists real sessions.
- Goals calls `/api/dashboard` and creates, completes, pauses, or deletes goals through `/api/data/goals/*`.
- AI Insights calls `/api/ai/insights` and displays the returned analysis or fallback.
- Profile calls `/api/dashboard` and `/api/data/profile`.
- Account deletion calls `/api/data/account`.
- Leaderboard uses the authenticated user's dashboard metrics rather than community mock entries.

## Static, dummy, incomplete, or disconnected surfaces

- `Frontend/src/components/ActiveSessionCard.jsx` contains Start/Stop and Reset buttons with no event behavior and is an independent UI duplicate of the real timer.
- `Frontend/src/components/timer.jsx` contains hardcoded active-session and session-detail values and is not the source for the implemented timer page.
- `Frontend/src/components/activity.jsx` is a hardcoded activity dataset and may suggest a mock API; it is not used by the live activity-log page.
- `Frontend/src/data/mockDashboard.js`, `Frontend/src/data/mockActivity.js`, `Frontend/src/data/index.js`, and `Backend/src/data/mockDashboard.js` are unused mock artifacts that must be removed or documented as legacy-only.
- `Frontend/src/pages/Goal_polished.jsx` appears to duplicate Goals UI and is unused; it does not contain CRUD behavior.
- `Frontend/src/pages/addTask.jsx` is not routed and has not been audited as an operational feature.
- `Frontend/src/components/AI.jsx` is effectively unused and does not implement any AI call.
- The leaderboard is not a real multi-user community ranking; it currently represents only the signed-in user's metrics as rank 1.
- Settings notification, preferred-time, and daily-goal controls are not persisted in MongoDB. Theme is stored only in browser localStorage.
- The profile page calls “Mastering” and “academic strengths” from focus/topic data; this language can overstate the evidence.
- The dashboard's `yesterdayDiff` is hardcoded and was not calculated from database records.
- `bestTopic` defaults to `Arrays` even when no real subject data exists.
- `bestTime` may be an inferred/fabricated heuristic rather than a statistically supported result.
- Session topic is free text instead of a normalized Subject model.
- Completed, missed, postponed, and scheduled plan session states do not exist.
- The timer does not resume after page refresh and does not preselect or link subjects/goals/plans.

## Broken or incomplete functionality

- Session deletion does not decrement `User.studyHours`, so deleting a session can leave the stored aggregate inconsistent.
- Dashboard streak logic counts unique session dates rather than verifying consecutive calendar-day streaks.
- `User.studyHours` is a duplicated aggregate that can diverge from actual session sums.
- Dashboard limits sessions to 30 records and goals to 10 records, and AI currently limits records to 30/10, so analytics are incomplete for larger histories.
- The heatmap only covers seven relative days and does not expose a real 12-week GitHub-style view.
- Subject distribution uses the `topic` string rather than subject records.
- Weekly and monthly statistics, planned-versus-actual time, missed/completed sessions, and workload imbalance are not available.
- AI requests are made from the frontend only when the AI Insights page loads. There is no explicit analysis history or generation period in MongoDB.
- Gemini response validation is minimal: it does not enforce a complete schema and does not save a generated analysis or plan.
- Gemini fallback is deterministic/rule-based, but the UI should continue to label this clearly when it is in use.
- The Gemini model in `.env` can become unavailable or quota-limited; the response cannot be trusted solely from provider configuration.
- Free-tier Gemini quota may cause timeout or rate-limit failures. The timeout/retry policy is inadequate for production reliability.
- No backend rate limiting or Helmet-style security headers are implemented.
- Environment variables are not validated at startup.
- MongoDB connection failure does not stop database-dependent requests with a clear service-unavailable response.
- JWT expiration and refresh behavior are absent.
- Auth middleware fallback secret exists in code and must not be used in production.
- Registration and login validate only required fields and do not robustly constrain email, username, password, or request payloads.
- Error responses vary and do not consistently preserve centralized error handling.
- The delete-account action is destructive and depends on confirmation in the UI, but account deletion currently has no password/re-authentication check.
- There are no backend or frontend tests in the package scripts.
- Frontend has no route-level loading or mobile sidebar behavior.
- There is no responsive design pass or end-to-end test setup.

## Missing backend and database components

- Subject model and subject CRUD.
- StudyPlan model for saved timetable state, accepted/draft/rejected status, and AI provenance.
- StudyActivity model for scheduled/completed/missed/postponed events and adaptation explanations.
- AIAnalysis model for saved Gemini/rule-based analyses, data period, prompt provider, and creation time.
- User settings/preferences model fields.
- Availability/preferences fields for days, hours, breaks, examination dates, and difficulty/priority.
- Dashboard analytics aggregation endpoint for full history.
- Plan generation, plan validation, plan save/edit/regenerate, and adaptive recomputation endpoints.
- Session update endpoint: sessions can be created/deleted but not edited.
- Subject linking on sessions/goals/plans.
- Goal progress derived from sessions instead of manual `completedHours`.
- Rate limiting and request validation middleware.

## Missing or incomplete AI functionality

- No structured plan-generation request workflow that asks Gemini for a timetable JSON.
- No deterministic overlap/deadline/availability validator after Gemini output.
- No plan review, edit, accept, regenerate, save, or history UI.
- No AI-generated analysis history or data-period coverage metadata.
- No evidence/citation map between generated insight and actual records.
- No adaptive re-planning on session completion/miss/postpone/availability/priority changes.
- No explanation of schedule changes.
- No Gemini result caching or request deduplication; repeated page loads can consume quota.
- No AI result schema validation library or explicit provider metadata.
- No handling for Google API quota exhaustion beyond generic fallback.

## Security and isolation findings

- Authenticated controllers mostly filter by `req.user.userId`, which is the correct isolation pattern.
- Login, registration, and current-user routes expose no password hashes.
- JWT is stored in browser localStorage; this is common for a student project but vulnerable to XSS and must be mitigated by output sanitization and CSP in production.
- The frontend API base URL is environment configurable and no API key is present in frontend code.
- No tenant-level database or route tests prove isolation across two users.

## Recommended implementation priorities

1. Remove hardcoded/unused data and add normalized Subject, settings, plan/activity, and analysis models.
2. Replace free-text timer subjects with subject CRUD and subject selection.
3. Implement secure startup validation, rate limiting, strict request validation, and centralized API responses.
4. Build real analytics aggregation from complete MongoDB history.
5. Implement plan-generation and saving with deterministic validation and review/edit acceptance.
6. Implement adaptive plan status and missing/postponed/completed session transitions.
7. Add AI analysis history and evidence links; cache and avoid repeated calls.
8. Improve the frontend into a responsive SaaS-style shell and remove dead controls.
9. Add isolated API tests and focused frontend smoke tests.
10. Update deployment documentation and perform no Git publication operations.
