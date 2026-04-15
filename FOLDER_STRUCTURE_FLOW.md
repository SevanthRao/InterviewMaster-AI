# Folder Structure And Working Flow

## 1. Root Level

### Files
- `PRD.md`
- `FEATURE_GUIDE.md`
- `EACH_FEATURE.md`
- `FOLDER_STRUCTURE_FLOW.md`
- `Backend/`
- `Frontend/`

### Meaning
- `PRD.md` is the requirement source.
- `FEATURE_GUIDE.md` explains the implemented project.
- `EACH_FEATURE.md` explains every feature separately.
- `FOLDER_STRUCTURE_FLOW.md` explains the actual structure and runtime flow.

---

## 2. Frontend Structure

### `Frontend/src`
Main React app source.

### `Frontend/src/features/auth`
Contains everything related to authentication.

Files:
- `auth.context.jsx`
- `hooks/useAuth.js`
- `Pages/Login.jsx`
- `Pages/Register.jsx`
- `components/Protected.jsx`
- `services/auth.api.js`

Working flow:
1. Page calls auth hook.
2. Auth hook reads auth context.
3. Auth context talks to backend auth API.
4. Protected route checks authenticated user.

### `Frontend/src/features/interview`
Contains the product features after login.

Files:
- `pages/Home.jsx`
- `pages/Dashboard.jsx`
- `pages/Interview.jsx`
- `pages/AptitudeTest.jsx`
- `pages/TechnicalTest.jsx`
- `services/interview.api.js`

Working flow:
1. `Home.jsx` creates a session.
2. `Dashboard.jsx` works on one saved session.
3. Other pages generate feature output from that same session.
4. `interview.api.js` is the only feature API layer used by those pages.

### `Frontend/src/features/shared`
Contains reusable pieces.

Files:
- `api.client.js`
- `toast.context.jsx`
- `Toast.jsx`
- `Spinner.jsx`

Working flow:
- `api.client.js` centralizes Axios config.
- toast files handle notifications.
- spinner is shared loading UI.

### Frontend Route Flow
Files:
- `Frontend/src/App.jsx`
- `Frontend/src/app.routes.jsx`
- `Frontend/src/main.jsx`

Working flow:
1. `main.jsx` starts the app.
2. `App.jsx` wraps the app with providers.
3. `app.routes.jsx` maps routes to pages.
4. protected routes force login before feature access.

---

## 3. Backend Structure

### `Backend/src/routes`
Defines API endpoints only.

Files:
- `auth.routes.js`
- `session.routes.js`
- `interview.routes.js`
- `aptitude.routes.js`
- `technical.routes.js`

Working flow:
1. Route receives request path.
2. Route runs middleware.
3. Route forwards request to controller.

### `Backend/src/controllers`
Contains request handling logic.

Files:
- `auth.controller.js`
- `session.controller.js`
- `interview.controller.js`
- `aptitude.controller.js`
- `technical.controller.js`

Working flow:
1. Validate request.
2. Query models if needed.
3. Call service if needed.
4. Shape response JSON or file download.

### `Backend/src/services`
Contains AI and generation logic.

Files:
- `ai.service.js`

Working flow:
1. Controller sends clean business input.
2. Service talks to AI model.
3. Service normalizes output.
4. Service returns structured data to controller.

### `Backend/src/models`
Contains MongoDB schemas.

Files:
- `user.model.js`
- `session.model.js`
- `interviewReport.model.js`
- `aptitudeTest.model.js`
- `technicalTest.model.js`
- `blacklist.model.js`

Working flow:
- models define what gets stored
- controllers read/write these models
- session is the main source model for the platform

### `Backend/src/middlewares`
Contains reusable request middleware.

Files:
- `auth.middleware.js`
- `file.middleware.js`

Working flow:
- auth middleware checks JWT and blacklisted tokens
- file middleware validates uploaded resume PDF

### `Backend/src/utils`
Contains helper utilities.

Files:
- `session-history.js`

Working flow:
- appends or prepends reusable history entries to a session

### `Backend/src/config`
Contains configuration modules.

Files:
- `database.js`

Working flow:
- server starts
- database config connects MongoDB
- app becomes ready after DB connection

---

## 4. Real End-To-End Flow

### Flow A: Login
1. Frontend login page sends credentials.
2. Backend validates user.
3. JWT cookie is returned.
4. Auth provider restores session.

### Flow B: Analyze Resume
1. User uploads resume and descriptions from Home.
2. Backend parses PDF.
3. Backend AI service analyzes fit.
4. Backend stores session.
5. Session history starts here.
6. Frontend opens dashboard for that session.

### Flow C: Edit Saved Session
1. User opens saved session dashboard.
2. User edits source fields only.
3. User clicks save.
4. Backend re-analyzes the session.
5. Backend updates derived fields.
6. Backend clears stale generated output.
7. Backend stores history entry.

### Flow D: Generate Feature Output
1. User clicks one of the four feature buttons.
2. Backend reads current saved session.
3. Backend generates or reuses feature output.
4. Backend stores history entry.
5. Frontend shows report/test or downloads PDF.

---

## 5. Why This Structure Is Good

### Good Separation
- frontend pages handle UI
- frontend services handle API calls
- backend routes handle URL mapping
- backend controllers handle request/response logic
- backend service handles AI logic
- backend models handle persistence

### Good Source Of Truth
The `Session` model is the center of the project.

Everything important depends on it:
- interview output
- tests
- resume generation
- history

### Good Update Rule
Only source fields are editable.

Derived fields are recalculated from source fields:
- title
- match score
- skill gaps

This avoids broken manual data combinations.

---

## 6. Mental Model To Understand The Project Fast

If you want to understand the project quickly, think like this:

1. Auth gets the user inside.
2. Home creates a session.
3. Session becomes the saved source data.
4. Dashboard edits that source data and shows history.
5. Feature pages generate outputs from that session.
6. Backend stores both outputs and session activity.
