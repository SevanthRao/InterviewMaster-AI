# Frontend File Purpose Index

This index covers the important frontend source and configuration files in the current `Frontend` folder. It intentionally ignores `Frontend/node_modules` and `Frontend/dist` because those are dependencies and generated build output.

## Root Frontend Files

### `Frontend/package.json`

Defines the frontend package, scripts, dependencies, and dev dependencies.

Scripts:
- `dev`: starts Vite.
- `build`: builds the app with Vite.
- `lint`: runs ESLint.
- `preview`: previews the Vite build.

Main dependencies:
- `react`
- `react-dom`
- `react-router`
- `axios`

Main dev tools:
- `vite`
- `@vitejs/plugin-react`
- `tailwindcss`
- `@tailwindcss/postcss`
- `eslint`

### `Frontend/index.html`

The HTML shell for the Vite app.

Purpose:
- Sets language to English.
- Loads `/favicon.svg`.
- Sets responsive viewport metadata.
- Sets page title to `Interlix`.
- Provides `<div id="root"></div>`.
- Loads `/src/main.jsx` as the module entry.

### `Frontend/vite.config.js`

Vite configuration.

Purpose:
- Imports `defineConfig` from `vite`.
- Imports React plugin from `@vitejs/plugin-react`.
- Exports Vite config with `plugins: [react()]`.

### `Frontend/postcss.config.js`

PostCSS configuration.

Purpose:
- Enables Tailwind CSS through the `@tailwindcss/postcss` plugin.

### `Frontend/eslint.config.js`

ESLint flat config.

Purpose:
- Ignores `dist`.
- Applies JS recommended rules.
- Applies React Hooks rules.
- Applies React Refresh Vite rules.
- Enables browser globals.
- Parses JSX modules.
- Configures `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'`.

### `Frontend/public/favicon.svg`

Favicon asset referenced by `Frontend/index.html`.

### `Frontend/public/icons.svg`

Public SVG asset available at runtime. It is copied into build output by Vite.

### `Frontend/README.md`

General frontend readme file. It is not imported by source code.

## App Entry Files

### `Frontend/src/main.jsx`

React entry point.

Purpose:
- Imports React `StrictMode`.
- Imports `createRoot` from `react-dom/client`.
- Imports global CSS from `./index.css`.
- Imports `App`.
- Mounts the React app into `document.getElementById('root')`.

Important behavior:
- Wraps `<App />` in `<StrictMode>`.

### `Frontend/src/App.jsx`

Top-level app composition.

Function:
- `App()`: returns the provider and route tree.

Purpose:
- Wraps the whole app in `ToastProvider`.
- Wraps routes in `AuthProvider`.
- Renders `AppRoutes`.
- Renders `ToastContainer` outside the routes so toasts can appear globally.

### `Frontend/src/app.routes.jsx`

Route table for the app.

Function:
- `AppRoutes()`: creates the `BrowserRouter`, `Routes`, and route elements.

Routes:
- `/` -> `Landing`
- `/login` -> `Login`
- `/register` -> `Register`
- `/app` -> `Protected` + `AppLayout` + `SessionsHome`
- `/app/session/:sessionId` -> `Protected` + `AppLayout` + `SessionDashboard`
- `/app/session/:sessionId/interview` -> `Protected` + `AppLayout` + `Interview`
- `/app/session/:sessionId/aptitude` -> `Protected` + `AptitudeTest`
- `/app/session/:sessionId/technical` -> `Protected` + `TechnicalTest`
- `*` -> `Navigate` to `/`

Important behavior:
- Authenticated app pages are protected by `Protected`.
- Dashboard and interview pages use `AppLayout`.
- Aptitude and technical tests are protected but full-screen, without `AppLayout`.

### `Frontend/src/index.css`

Global CSS, Tailwind import, tokens, animations, and reusable utility classes.

Purpose:
- Imports Tailwind CSS.
- Imports the Inter font from Google Fonts.
- Defines CSS custom properties for colors, text, borders, radii, shadows, and layout sizes.
- Defines base styles for `html`, `body`, and scrollbar.
- Defines animation keyframes and utility classes.
- Defines reusable component classes such as `glass-card`, `gradient-text`, `gradient-button`, `input-field`, `textarea-field`, and `upload-drop-zone`.

Design tokens:
- Background: `--bg-primary`, `--bg-surface`, `--bg-elevated`, `--bg-hover`
- Accents: `--accent-primary`, `--accent-primary-light`, `--accent-secondary`, `--accent-success`, `--accent-warning`, `--accent-danger`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Border: `--border`, `--border-hover`
- Layout: `--sidebar-width`, `--sidebar-collapsed`, `--topbar-height`

## API Client

### `Frontend/src/lib/api.client.js`

Shared Axios client.

Exports:
- `apiClient`

Purpose:
- Reads `import.meta.env.VITE_API_BASE_URL`.
- Falls back to `http://localhost:5000`.
- Creates an Axios instance with `withCredentials: true`, so cookie-based auth/session requests are included.

## Contexts And Hooks

### `Frontend/src/contexts/auth.context.jsx`

Auth state provider.

Exports:
- `AuthContext`
- `AuthProvider`

State:
- `user`
- `loading`
- `authenticating`

Important functions:
- `bootstrapAuth`: runs once in `useEffect`, calls `getMe()`, stores `data.user ?? null`, and clears `loading`.
- `handleLogin({ email, password })`: calls auth `login`, stores returned user, and returns a success/error object.
- `handleRegister({ username, email, password })`: calls auth `register`, stores returned user, and returns a success/error object.
- `handleLogout()`: calls auth `logout`, clears the user, and returns a success/error object.

API calls used:
- `getMe()` -> `GET /api/auth/get-me`
- `login()` -> `POST /api/auth/login`
- `register()` -> `POST /api/auth/register`
- `logout()` -> `GET /api/auth/logout`

### `Frontend/src/hooks/useAuth.js`

Auth hook.

Exports:
- `useAuth()`

Purpose:
- Reads `AuthContext` with `useContext`.
- Throws `useAuth must be used within an AuthProvider` if used outside the provider.
- Returns the auth context value: `user`, `loading`, `authenticating`, `handleLogin`, `handleRegister`, and `handleLogout`.

### `Frontend/src/contexts/toast.context.jsx`

Toast state provider and hook.

Exports:
- `ToastContext`
- `ToastProvider`
- `useToast()`

State:
- `toasts`

Important functions:
- `addToast({ message, type = "info", duration = 4000 })`: creates a toast with an incrementing id, schedules exit state, then removes it after the animation delay.
- `removeToast(id)`: marks a toast as exiting and removes it after 300 ms.
- `useToast()`: reads `ToastContext` and throws if used outside `ToastProvider`.

## Auth Components And Pages

### `Frontend/src/features/auth/components/Protected.jsx`

Route guard component.

Function:
- `Protected({ children })`

Purpose:
- Reads `loading` and `user` from `useAuth`.
- Shows `<PageLoader message="Authenticating..." />` while auth bootstrap is active.
- Redirects unauthenticated users to `/login`.
- Returns `children` when authenticated.

### `Frontend/src/features/auth/Pages/Login.jsx`

Login page.

Component:
- `Login()`

State:
- `email`
- `password`
- `error`
- `fieldErrors`
- `submitting`

Important functions:
- `validate()`: checks required email, email format, and required password.
- `handleSubmit(e)`: prevents default form submission, clears old error, validates, calls `handleLogin`, and navigates to `/app` on success.

User behavior:
- Shows `PageLoader` while global auth loading is true.
- Redirects authenticated users to `/app`.
- Renders `AuthLayout` with title `Welcome back`.
- Shows field-level validation errors and a submit spinner.
- Links to `/register`.

### `Frontend/src/features/auth/Pages/Register.jsx`

Register page.

Component:
- `Register()`

State:
- `username`
- `email`
- `password`
- `error`
- `fieldErrors`
- `submitting`

Important functions:
- `validate()`: checks required username, minimum username length of 3, required email, email format, required password, and minimum password length of 6.
- `handleSubmit(e)`: prevents default form submission, validates, calls `handleRegister`, and navigates to `/app` on success.

User behavior:
- Shows `PageLoader` while global auth loading is true.
- Redirects authenticated users to `/app`.
- Renders `AuthLayout` with title `Create account`.
- Shows field-level validation errors and a submit spinner.
- Links to `/login`.

### `Frontend/src/features/auth/services/auth.api.js`

Auth service functions.

Exports:
- `register({ username, email, password })`: `POST /api/auth/register`
- `login({ email, password })`: `POST /api/auth/login`
- `logout()`: `GET /api/auth/logout`
- `getMe()`: `GET /api/auth/get-me`

Used by:
- `Frontend/src/contexts/auth.context.jsx`

## Layouts

### `Frontend/src/layouts/AuthLayout.jsx`

Shared auth page layout.

Component:
- `AuthLayout({ children, title, subtitle })`

Purpose:
- Renders a full-screen two-column auth layout.
- Left desktop panel shows brand content and feature pills.
- Right panel centers the login/register form.
- Mobile header shows a link back to `/`.
- Uses `gradient-text`, inline gradient background, glass-like panels, and CSS variables.

### `Frontend/src/layouts/AppLayout.jsx`

Authenticated app shell.

Component:
- `AppLayout({ children })`

State:
- `sidebarCollapsed`
- `sessions`
- `loadingSessions`

Important functions:
- `fetchSessions`: calls `getAllSessions()` and stores `data.sessions || []`; refetches when `location.pathname` changes.
- `onLogout()`: calls `handleLogout()`, shows an error toast on failure, and navigates to `/login` on success.

Purpose:
- Renders the fixed sidebar and main content area.
- Shows Interlix logo, collapse button, New Session nav link, session history buttons, user info, and logout button.
- Uses `params.sessionId` to highlight the active session.
- Uses score thresholds to color session dots.
- Adjusts main content left margin based on collapsed sidebar width.

API calls used:
- `getAllSessions()` -> `GET /api/session/`

## Shared Components

### `Frontend/src/components/Spinner.jsx`

Reusable SVG spinner.

Component:
- `Spinner({ size = 'md', className = '' })`

Purpose:
- Maps size values `sm`, `md`, `lg`, and `xl` to Tailwind width/height classes.
- Renders a spinning circular SVG.

### `Frontend/src/components/PageLoader.jsx`

Full-page loader.

Component:
- `PageLoader({ message = "Loading..." })`

Purpose:
- Centers a large `Spinner`.
- Shows a loading message.
- Uses `var(--bg-primary)` and `var(--text-muted)`.

### `Frontend/src/components/Toast.jsx`

Global toast renderer.

Constants:
- `ICONS`: SVG icon map for `success`, `error`, `warning`, and `info`.
- `STYLES`: Tailwind class map for toast colors by type.

Component:
- `ToastContainer()`

Purpose:
- Reads `toasts` and `removeToast` from `useToast`.
- Returns `null` when no toasts exist.
- Renders fixed top-right toast cards.
- Applies `toast-enter` or `toast-exit` classes based on toast state.
- Allows manual removal through a close button.

## Landing Feature

### `Frontend/src/features/landing/pages/Landing.jsx`

Public landing page.

Constants:
- `FEATURES`: feature card content for AI resume analysis, interview preparation, aptitude/technical tests, and AI-generated resume.
- `STEPS`: three-step explanation for upload, AI analysis, and preparation.

Component:
- `Landing()`

Purpose:
- Renders public marketing content for Interlix.
- Includes fixed navbar with Login and Get Started links.
- Includes hero section, how-it-works section, feature grid, CTA card, and footer.
- Uses `Link` from React Router to route users to `/login` and `/register`.

## Sessions Feature

### `Frontend/src/features/sessions/pages/SessionsHome.jsx`

New session creation page at `/app`.

Component:
- `SessionsHome()`

State:
- `jobDescription`
- `selfDescription`
- `resumeFile`
- `error`
- `submitting`
- `sessions`
- `loadingSessions`
- `isDragging`

Refs:
- `fileInputRef`
- `dragCounterRef`

Important functions:
- `fetchSessions`: calls `getAllSessions()` and stores sessions. The current JSX does not render the stored `sessions`.
- `processFile(file)`: validates file presence, PDF MIME type, and 3 MB max size.
- `handleFileChange(e)`: processes the selected file.
- `handleDragEnter(e)`: prevents default behavior, increments drag counter, and sets drag state.
- `handleDragLeave(e)`: decrements drag counter and clears drag state when all drag leaves are complete.
- `handleDragOver(e)`: prevents default drag-over behavior.
- `handleDrop(e)`: processes the dropped file and clears drag state.
- `handleRemoveFile()`: clears `resumeFile` and resets the hidden input value.
- `formatFileSize(bytes)`: formats bytes into B, KB, or MB.
- `handleAnalyzeResume()`: validates job description, resume PDF, and self description; calls `createSession`; shows success toast; navigates to `/app/session/:sessionId`.

API calls used:
- `getAllSessions()` -> `GET /api/session/`
- `createSession()` -> `POST /api/session/`

Visible source observation:
- `SessionCard` is imported but not rendered in the current `SessionsHome` JSX.

### `Frontend/src/features/sessions/pages/SessionDashboard.jsx`

Session dashboard page at `/app/session/:sessionId`.

Constants:
- `FEATURES`: four dashboard tools: interview, aptitude, technical, and resume.

Helpers:
- `createFormState(session)`: creates editable form state from a session.
- `buildSessionPayload(source)`: trims editable fields for API payloads and dirty checks.

Component:
- `SessionDashboard()`

State:
- `session`
- `form`
- `loading`
- `saving`
- `error`
- `pdfLoading`

Derived state:
- `isDirty`: compares current form payload to original session payload.

Important functions:
- `fetchSession`: calls `getSessionById(sessionId)` and sets session/form state.
- `handleFeatureClick(feature)`: downloads resume PDF for the resume feature; otherwise navigates to `/app/session/:sessionId/:feature.path`.
- `handleFieldChange(field, value)`: updates one field in the editable session form.
- `handleSave()`: validates editable fields, calls `updateSession`, refreshes local session/form state, and shows a toast.

API calls used:
- `getSessionById(sessionId)` -> `GET /api/session/:sessionId`
- `updateSession(sessionId, payload)` -> `PATCH /api/session/:sessionId`
- `generateResumePDF(sessionId)` -> `POST /api/interview/:sessionId/resume/pdf`

UI:
- Back button to `/app`.
- Match score gauge.
- Skill gap badges.
- AI tool cards.
- History timeline.
- Editable session data form.
- Full-screen PDF generation overlay.

### `Frontend/src/features/sessions/services/session.api.js`

Session service functions.

Exports:
- `createSession({ jobDescription, selfDescription, resumeFile })`: builds `FormData` and sends `POST /api/session/` with `multipart/form-data`.
- `getSessionById(sessionId)`: `GET /api/session/:sessionId`.
- `updateSession(sessionId, payload)`: `PATCH /api/session/:sessionId`.
- `getAllSessions()`: `GET /api/session/`.
- `generateResumePDF(sessionId)`: `POST /api/interview/:sessionId/resume/pdf` with `responseType: "blob"`.

### `Frontend/src/features/sessions/components/FeatureCard.jsx`

Dashboard tool card.

Component:
- `FeatureCard({ icon, title, description, color, onClick, loading, disabled })`

Purpose:
- Renders a clickable glass-card button for a session tool.
- Shows loading text and spinner when `loading` is true.
- Disables itself when `disabled || loading`.
- Uses per-card accent color for icon container.

### `Frontend/src/features/sessions/components/SkillGapBadge.jsx`

Skill gap badge.

Component:
- `SkillGapBadge({ skill, severity })`

Purpose:
- Maps severity values `high`, `medium`, and `low` to background, border, and text colors.
- Defaults unknown severity to `low`.
- Renders the skill name inside a pill.

### `Frontend/src/features/sessions/components/HistoryTimeline.jsx`

Session history timeline.

Component:
- `HistoryTimeline({ history })`

Purpose:
- Shows an empty message when history is missing or empty.
- Maps each history entry to a timeline dot, optional connecting line, label, optional detail, and formatted timestamp.

Expected entry fields from usage:
- `type`
- `createdAt`
- `label`
- `detail`

### `Frontend/src/features/sessions/components/MatchScoreGauge.jsx`

Large circular match score gauge.

Component:
- `MatchScoreGauge({ score })`

Purpose:
- Calculates SVG circumference and dash offset from `score`.
- Chooses success, warning, or danger color based on thresholds: `>= 70`, `>= 40`, otherwise low.
- Renders score percentage in the center.

### `Frontend/src/features/sessions/components/SessionCard.jsx`

Session summary card.

Component:
- `SessionCard({ session, onClick })`

Purpose:
- Renders a clickable glass-card for a session.
- Shows a smaller circular match score gauge.
- Shows session title, creation date, latest history label if available, and an arrow icon.

Visible source observation:
- It imports `MatchScoreGauge` but renders its own inline SVG gauge instead.
- It is imported by `SessionsHome` but not rendered in the current `SessionsHome` JSX.

## Interview Feature

### `Frontend/src/features/interview/pages/Interview.jsx`

Interview preparation page at `/app/session/:sessionId/interview`.

Constants:
- `NAV_ITEMS`: tab definitions for technical, behavioral, and roadmap.

Component:
- `Interview()`

State:
- `activeNav`
- `report`
- `session`
- `loading`
- `generating`
- `error`

Important functions:
- `fetchData`: loads session data with `getSessionById(sessionId)` and then tries to load the existing interview report with `getInterviewReport(sessionId)`. A `404` report response is allowed and means no report exists yet.
- `handleGenerate()`: calls `generateInterviewReport(sessionId)`, stores `data.interviewReport`, and shows a success toast.

API calls used:
- `getSessionById(sessionId)` -> `GET /api/session/:sessionId`
- `getInterviewReport(sessionId)` -> `GET /api/interview/:sessionId`
- `generateInterviewReport(sessionId)` -> `POST /api/interview/:sessionId/generate`

UI:
- Generate prompt when no report exists.
- Loading overlay while generating.
- Tabbed report view after generation.
- Technical and behavioral question cards with intention and answer.
- Roadmap day cards with focus and tasks.
- Session side panel with match score and skill gaps.

### `Frontend/src/features/interview/services/interview.api.js`

Interview service functions.

Exports:
- `generateInterviewReport(sessionId)`: `POST /api/interview/:sessionId/generate`.
- `getInterviewReport(sessionId)`: `GET /api/interview/:sessionId`.
- `getSessionById(sessionId)`: `GET /api/session/:sessionId`.

## Aptitude Feature

### `Frontend/src/features/aptitude/pages/AptitudeTest.jsx`

Full-screen aptitude test page at `/app/session/:sessionId/aptitude`.

Constants:
- `TIME_OPTIONS`: `[10, 15, 20, 30]`
- `COUNT_OPTIONS`: `[10, 15, 20]`

Component:
- `AptitudeTest()`

State:
- `phase`: `config`, `test`, or `results`.
- `timeLimit`
- `questionCount`
- `generating`
- `submitting`
- `testId`
- `questions`
- `answers`
- `currentQ`
- `timeLeft`
- `result`

Refs:
- `timerRef`

Important functions:
- `handleSubmit`: submits `answers` for `testId`, stores result, changes phase to `results`, clears the timer, and shows a toast.
- Timer `useEffect`: counts down every second during test phase and auto-submits when time reaches the end.
- `formatTime(seconds)`: formats seconds as `MM:SS`.
- `handleGenerate()`: calls `generateAptitudeTest`, stores the returned test id and questions, initializes answer array with `-1`, sets `timeLeft`, and changes phase to `test`.
- `handleAnswerSelect(optionIndex)`: stores the selected option index for the current question.

API calls used:
- `generateAptitudeTest(sessionId, { timeLimit, questionCount })` -> `POST /api/aptitude/:sessionId/generate`
- `submitAptitudeTest(testId, answers)` -> `POST /api/aptitude/:testId/submit`

UI phases:
- `config`: choose time limit and number of questions, then start test.
- `test`: timer, progress bar, question navigator, options, previous/next buttons, submit button.
- `results`: score, pass/fail status, dashboard link, retake button, and question review.

### `Frontend/src/features/aptitude/services/aptitude.api.js`

Aptitude service functions.

Exports:
- `generateAptitudeTest(sessionId, { timeLimit, questionCount })`: `POST /api/aptitude/:sessionId/generate`.
- `getAptitudeTest(testId)`: `GET /api/aptitude/:testId`.
- `submitAptitudeTest(testId, answers)`: `POST /api/aptitude/:testId/submit`.

Visible source observation:
- `getAptitudeTest` is exported but not imported by `AptitudeTest.jsx`.

## Technical Feature

### `Frontend/src/features/technical/pages/TechnicalTest.jsx`

Full-screen technical test page at `/app/session/:sessionId/technical`.

Component:
- `TechnicalTest()`

State:
- `phase`: `intro`, `test`, or `results`.
- `generating`
- `submitting`
- `testId`
- `questions`
- `answers`
- `currentQ`
- `result`

Important functions:
- `handleGenerate()`: calls `generateTechnicalTest(sessionId)`, stores the returned test id/questions, initializes blank string answers, and changes phase to `test`.
- `handleAnswerChange(value)`: updates the current answer string.
- `handleSubmit()`: calls `submitTechnicalTest(testId, answers)`, stores result, changes phase to `results`, and shows a toast.

API calls used:
- `generateTechnicalTest(sessionId)` -> `POST /api/technical/:sessionId/generate`
- `submitTechnicalTest(testId, answers)` -> `POST /api/technical/:testId/submit`

UI phases:
- `intro`: explains test format and starts generation.
- `test`: one short-answer question at a time, progress bar, input, previous/next controls, and submit on the last question.
- `results`: score, pass/fail status, dashboard link, retake button, and answer review.

### `Frontend/src/features/technical/services/technical.api.js`

Technical service functions.

Exports:
- `generateTechnicalTest(sessionId)`: `POST /api/technical/:sessionId/generate`.
- `getTechnicalTest(testId)`: `GET /api/technical/:testId`.
- `submitTechnicalTest(testId, answers)`: `POST /api/technical/:testId/submit`.

Visible source observation:
- `getTechnicalTest` is exported but not imported by `TechnicalTest.jsx`.

## API Call Locations

| API Function | Service File | HTTP Request | Called From |
| --- | --- | --- | --- |
| `register` | `features/auth/services/auth.api.js` | `POST /api/auth/register` | `AuthProvider.handleRegister` |
| `login` | `features/auth/services/auth.api.js` | `POST /api/auth/login` | `AuthProvider.handleLogin` |
| `logout` | `features/auth/services/auth.api.js` | `GET /api/auth/logout` | `AuthProvider.handleLogout` |
| `getMe` | `features/auth/services/auth.api.js` | `GET /api/auth/get-me` | `AuthProvider.bootstrapAuth` |
| `createSession` | `features/sessions/services/session.api.js` | `POST /api/session/` | `SessionsHome.handleAnalyzeResume` |
| `getSessionById` | `features/sessions/services/session.api.js` | `GET /api/session/:sessionId` | `SessionDashboard.fetchSession` |
| `updateSession` | `features/sessions/services/session.api.js` | `PATCH /api/session/:sessionId` | `SessionDashboard.handleSave` |
| `getAllSessions` | `features/sessions/services/session.api.js` | `GET /api/session/` | `AppLayout.fetchSessions`, `SessionsHome.fetchSessions` |
| `generateResumePDF` | `features/sessions/services/session.api.js` | `POST /api/interview/:sessionId/resume/pdf` | `SessionDashboard.handleFeatureClick` |
| `generateInterviewReport` | `features/interview/services/interview.api.js` | `POST /api/interview/:sessionId/generate` | `Interview.handleGenerate` |
| `getInterviewReport` | `features/interview/services/interview.api.js` | `GET /api/interview/:sessionId` | `Interview.fetchData` |
| `getSessionById` | `features/interview/services/interview.api.js` | `GET /api/session/:sessionId` | `Interview.fetchData` |
| `generateAptitudeTest` | `features/aptitude/services/aptitude.api.js` | `POST /api/aptitude/:sessionId/generate` | `AptitudeTest.handleGenerate` |
| `getAptitudeTest` | `features/aptitude/services/aptitude.api.js` | `GET /api/aptitude/:testId` | Exported, not used by current page |
| `submitAptitudeTest` | `features/aptitude/services/aptitude.api.js` | `POST /api/aptitude/:testId/submit` | `AptitudeTest.handleSubmit` |
| `generateTechnicalTest` | `features/technical/services/technical.api.js` | `POST /api/technical/:sessionId/generate` | `TechnicalTest.handleGenerate` |
| `getTechnicalTest` | `features/technical/services/technical.api.js` | `GET /api/technical/:testId` | Exported, not used by current page |
| `submitTechnicalTest` | `features/technical/services/technical.api.js` | `POST /api/technical/:testId/submit` | `TechnicalTest.handleSubmit` |

## Learning Summary

The frontend is session-centered. A user starts on the landing page, signs in or registers, creates a session from a job description, resume PDF, and self description, then lands on a dashboard for that session. From the dashboard, the user can open interview preparation, start aptitude and technical tests, edit the saved session source text, or download a generated resume PDF.

For development:
- Start with `app.routes.jsx` to understand navigation.
- Start with `auth.context.jsx` to understand auth state.
- Start with `api.client.js` and service files to understand HTTP calls.
- Start with `SessionsHome.jsx` and `SessionDashboard.jsx` to understand the core product flow.
- Start with `index.css` to understand the visual system.
