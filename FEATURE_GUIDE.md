# InterviewMaster-AI Feature Guide

## 1. What This Project Does
InterviewMaster-AI is an AI-based interview preparation platform.

The current implementation follows this main flow:

1. User registers or logs in.
2. User uploads a resume PDF, adds a self description, and pastes a job description.
3. Backend parses the PDF and asks AI to analyze the candidate fit.
4. A `session` is created with:
   - resume text
   - self description
   - job description
   - AI title
   - match score
   - skill gaps
5. User opens the dashboard for that session.
6. User can generate:
   - interview approach
   - aptitude test
   - technical test
   - AI resume PDF

---

## 2. Architecture Summary

### Frontend
The frontend is feature-based:

- `src/features/auth`
  Handles login, registration, route protection, and session bootstrap.
- `src/features/interview`
  Handles session creation, dashboard, interview report, aptitude test, technical test, and resume PDF download.
- `src/features/shared`
  Shared UI and utilities like toast notifications, spinner, and shared API client.

### Backend
The backend is layered like this:

- `routes`
  Defines the API endpoints.
- `controllers`
  Handles request validation and response shaping.
- `services`
  Contains AI logic.
- `models`
  MongoDB schemas for users, sessions, reports, and tests.
- `middlewares`
  Auth and file upload handling.

---

## 3. Implemented Features

### Authentication
Frontend:
- `Frontend/src/features/auth/auth.context.jsx`
- `Frontend/src/features/auth/components/Protected.jsx`
- `Frontend/src/features/auth/Pages/Login.jsx`
- `Frontend/src/features/auth/Pages/Register.jsx`

Backend:
- `Backend/src/routes/auth.routes.js`
- `Backend/src/controllers/auth.controller.js`

Behavior:
- Register creates a user with hashed password.
- Login issues a JWT in an HTTP-only cookie.
- `get-me` restores the session on page refresh.
- Protected routes redirect unauthenticated users to `/login`.
- Logout clears the cookie and blacklists the token.

### Resume Upload And Session Creation
Frontend:
- `Frontend/src/features/interview/pages/Home.jsx`
- `Frontend/src/features/interview/services/interview.api.js`

Backend:
- `Backend/src/routes/session.routes.js`
- `Backend/src/controllers/session.controller.js`
- `Backend/src/middlewares/file.middleware.js`
- `Backend/src/services/ai.service.js`
- `Backend/src/models/session.model.js`

Behavior:
- User uploads a PDF resume.
- Backend extracts text using `pdf-parse`.
- AI analyzes candidate fit against the job description.
- A session is stored in MongoDB.
- The session becomes the base record for all later features.

Saved session fields:
- `resume`
- `selfDescription`
- `jobDescription`
- `title`
- `matchScore`
- `skillGaps`

### Dashboard
Frontend:
- `Frontend/src/features/interview/pages/Dashboard.jsx`

Backend:
- `Backend/src/controllers/session.controller.js`

Behavior:
- Fetches one session by `sessionId`.
- Shows:
  - session title
  - created date
  - match score
  - skill gaps
- Provides editable fields for:
  - title
  - match score
  - self description
  - job description
  - resume text
  - skill gaps
- Save button persists edits through `PATCH /api/session/:sessionId`.
- Saving clears previously generated reports/tests so future outputs stay aligned with the latest session data.
- Provides entry points to all AI features for that session.

### Interview Approach
Frontend:
- `Frontend/src/features/interview/pages/Interview.jsx`

Backend:
- `Backend/src/routes/interview.routes.js`
- `Backend/src/controllers/interview.controller.js`
- `Backend/src/models/interviewReport.model.js`

Behavior:
- Generates one interview report per session.
- Report contains:
  - technical questions
  - behavioral questions
  - 7-day preparation roadmap
- If a report already exists, backend returns the existing one instead of generating again.

### Aptitude Test
Frontend:
- `Frontend/src/features/interview/pages/AptitudeTest.jsx`

Backend:
- `Backend/src/routes/aptitude.routes.js`
- `Backend/src/controllers/aptitude.controller.js`
- `Backend/src/models/aptitudeTest.model.js`

Behavior:
- User chooses time limit and question count.
- AI generates MCQ aptitude questions.
- Correct answers stay hidden until submission.
- After submit, backend calculates score and returns full review with explanations.

### Technical Test
Frontend:
- `Frontend/src/features/interview/pages/TechnicalTest.jsx`

Backend:
- `Backend/src/routes/technical.routes.js`
- `Backend/src/controllers/technical.controller.js`
- `Backend/src/models/technicalTest.model.js`

Behavior:
- AI generates 5 short-answer technical questions.
- User types answers.
- Backend compares answers case-insensitively after trimming.
- Result view shows score, correct answers, and explanations.

### AI Resume PDF
Frontend:
- `Frontend/src/features/interview/pages/Dashboard.jsx`

Backend:
- `Backend/src/controllers/interview.controller.js`
- `Backend/src/services/ai.service.js`

Behavior:
- AI generates refined resume HTML on demand.
- Generated HTML is cached in the session document.
- Puppeteer converts HTML to PDF.
- Frontend downloads the PDF for the current session.

---

## 4. Data Flow

### Main User Flow
1. Authenticated user opens Home.
2. User creates a session.
3. Session becomes the source of truth.
4. Other features read from that session:
   - interview report
   - aptitude test
   - technical test
   - resume PDF

### Important Models
- `User`
  Stores account details.
- `Session`
  Stores base resume/job analysis data.
- `InterviewReport`
  Stores generated interview preparation output.
- `AptitudeTest`
  Stores MCQ test, answers, score, and explanations.
- `TechnicalTest`
  Stores short-answer test, answers, score, and explanations.

---

## 5. Refinements Done In This Cleanup

- Moved auth bootstrap logic into the auth provider so session restoration happens once, not in every component using `useAuth`.
- Added a shared frontend API client instead of creating duplicate Axios instances in multiple files.
- Removed dead interview context/hook files that were not used and referenced non-existent API functions.
- Rebuilt the AI service with:
  - lazy model initialization
  - output normalization
  - safer HTML-to-PDF generation
  - clearer prompt structure
- Made CORS origins configurable through `CORS_ALLOWED_ORIGINS`.
- Normalized email and username handling in auth flows.
- Added safer async effect cleanup in session-driven frontend pages.

---

## 6. Current Gaps Compared To PRD

These PRD items are still not fully implemented yet:

- Auto-recalculation flow for match score/title/skill gaps after manual edits.
- A richer resume management flow such as versioning or editable refined resume HTML.
- Broader automated coverage beyond the targeted backend tests added in this refinement pass.

---

## 7. Suggested Next Improvements

### High Priority
- Add an optional "Re-analyze Session" action that regenerates title, match score, and skill gaps from the edited base content.
- Add a separate endpoint for editing the refined resume HTML directly if resume customization should become part of the product.

### Medium Priority
- Add backend validation helpers to reduce repeated ObjectId and ownership checks.
- Add integration tests for auth, session creation, and test submission flows.
- Add loading/error state components to reduce repeated UI markup.

### Nice To Have
- Prevent duplicate aptitude/technical test generation if one active attempt already exists.
- Add resume version history per session.
- Add analytics on weak skill areas across sessions.

---

## 8. Practical Reading Order

If you want to understand the project quickly, read files in this order:

1. `PRD.md`
2. `Frontend/src/app.routes.jsx`
3. `Frontend/src/features/auth/auth.context.jsx`
4. `Frontend/src/features/interview/pages/Home.jsx`
5. `Frontend/src/features/interview/pages/Dashboard.jsx`
6. `Backend/src/routes/session.routes.js`
7. `Backend/src/controllers/session.controller.js`
8. `Backend/src/services/ai.service.js`

That sequence shows the real app flow from user action to backend AI handling.
