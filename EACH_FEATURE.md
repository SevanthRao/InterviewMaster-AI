# Each Feature Explained

## 1. Authentication

### Purpose
Allows a user to create an account, log in, stay logged in, and access protected pages.

### Frontend Files
- `Frontend/src/features/auth/auth.context.jsx`
- `Frontend/src/features/auth/hooks/useAuth.js`
- `Frontend/src/features/auth/Pages/Login.jsx`
- `Frontend/src/features/auth/Pages/Register.jsx`
- `Frontend/src/features/auth/components/Protected.jsx`

### Backend Files
- `Backend/src/routes/auth.routes.js`
- `Backend/src/controllers/auth.controller.js`
- `Backend/src/middlewares/auth.middleware.js`
- `Backend/src/models/user.model.js`
- `Backend/src/models/blacklist.model.js`

### Working Flow
1. User registers or logs in from the frontend.
2. Backend validates input and stores a hashed password.
3. Backend returns an HTTP-only JWT cookie.
4. Frontend auth provider calls `get-me` on load.
5. Protected routes allow access only when the user exists.
6. Logout blacklists the token and clears the cookie.

---

## 2. Resume Analyze And Session Creation

### Purpose
Creates the base session that every other feature uses.

### Frontend Files
- `Frontend/src/features/interview/pages/Home.jsx`
- `Frontend/src/features/interview/services/interview.api.js`

### Backend Files
- `Backend/src/routes/session.routes.js`
- `Backend/src/controllers/session.controller.js`
- `Backend/src/middlewares/file.middleware.js`
- `Backend/src/services/ai.service.js`
- `Backend/src/models/session.model.js`

### Working Flow
1. User uploads a PDF resume.
2. User enters self description and job description.
3. Backend extracts resume text using `pdf-parse`.
4. Backend sends resume text, self description, and job description to AI.
5. AI returns:
   - title
   - match score
   - skill gaps
6. Backend stores a `Session`.
7. First history item is saved as `Resume analyzed`.

### Why This Feature Matters
This session is the source of truth for:
- interview approach
- aptitude test
- technical test
- AI resume
- history

---

## 3. Saved Session Dashboard

### Purpose
Shows one saved session and lets the user work from it.

### Frontend Files
- `Frontend/src/features/interview/pages/Dashboard.jsx`

### Backend Files
- `Backend/src/controllers/session.controller.js`
- `Backend/src/models/session.model.js`

### Working Flow
1. User clicks a saved session from Home.
2. Frontend opens `/dashboard/:sessionId`.
3. Backend returns that session only if it belongs to the logged-in user.
4. Dashboard shows:
   - recent history of that session
   - editable source fields
   - derived summary
   - feature buttons

### Editable Data
Only these three source fields are editable:
- self description
- job description
- resume text

### Save Flow
1. User edits those fields.
2. Frontend sends `PATCH /api/session/:sessionId`.
3. Backend re-analyzes the updated source data.
4. Backend updates:
   - title
   - match score
   - skill gaps
5. Backend clears older generated materials so they do not become stale.
6. Backend writes a `Session updated` history entry.

---

## 4. Session History

### Purpose
Stores a timeline of what happened for one saved session.

### Main Files
- `Backend/src/models/session.model.js`
- `Backend/src/utils/session-history.js`
- `Frontend/src/features/interview/pages/Home.jsx`
- `Frontend/src/features/interview/pages/Dashboard.jsx`

### What Gets Saved
- resume analyzed
- session updated
- interview approach generated
- aptitude test generated
- technical test generated
- AI resume generated

### Working Flow
1. An important action happens.
2. Backend prepends a history entry into `session.history`.
3. Home shows the latest history item for each saved session.
4. Dashboard shows the full history list for the clicked session.

---

## 5. Interview Approach

### Purpose
Generates interview preparation content from the saved session.

### Frontend Files
- `Frontend/src/features/interview/pages/Interview.jsx`

### Backend Files
- `Backend/src/routes/interview.routes.js`
- `Backend/src/controllers/interview.controller.js`
- `Backend/src/models/interviewReport.model.js`
- `Backend/src/services/ai.service.js`

### Working Flow
1. User clicks `Interview Approach`.
2. Backend checks whether a report already exists.
3. If it exists, backend reuses it.
4. If it does not exist, AI generates:
   - technical questions
   - behavioral questions
   - 7-day roadmap
5. Backend stores the report.
6. Backend saves history for that session.

---

## 6. Aptitude Test

### Purpose
Generates a timed MCQ test using the current saved session.

### Frontend Files
- `Frontend/src/features/interview/pages/AptitudeTest.jsx`

### Backend Files
- `Backend/src/routes/aptitude.routes.js`
- `Backend/src/controllers/aptitude.controller.js`
- `Backend/src/models/aptitudeTest.model.js`
- `Backend/src/services/ai.service.js`

### Working Flow
1. User selects time and question count.
2. Backend generates questions from AI.
3. Backend stores the test.
4. History entry is added.
5. User answers and submits.
6. Backend calculates score and returns review data.

---

## 7. Technical Test

### Purpose
Generates short-answer technical questions using the current saved session.

### Frontend Files
- `Frontend/src/features/interview/pages/TechnicalTest.jsx`

### Backend Files
- `Backend/src/routes/technical.routes.js`
- `Backend/src/controllers/technical.controller.js`
- `Backend/src/models/technicalTest.model.js`
- `Backend/src/services/ai.service.js`

### Working Flow
1. User clicks `Technical Test`.
2. Backend generates 5 basic technical questions.
3. Backend stores the test.
4. History entry is added.
5. User submits short answers.
6. Backend compares answers and returns review data.

---

## 8. AI Resume

### Purpose
Creates a refined resume PDF from the current saved session.

### Frontend Files
- `Frontend/src/features/interview/pages/Dashboard.jsx`

### Backend Files
- `Backend/src/controllers/interview.controller.js`
- `Backend/src/services/ai.service.js`
- `Backend/src/models/session.model.js`

### Working Flow
1. User clicks `AI Resume`.
2. Backend generates resume HTML from the session if needed.
3. Backend caches the generated HTML into the session.
4. Puppeteer converts that HTML into PDF.
5. Backend saves a history entry.
6. Frontend downloads the PDF.

---

## 9. Important Product Rule

Every feature after analysis must use the saved session as input.

That means:
- if session data changes
- the session is re-analyzed
- old generated outputs are cleared
- new outputs are generated only from the latest saved session data

This keeps the architecture consistent and avoids stale results.
