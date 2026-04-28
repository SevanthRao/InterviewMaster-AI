# Frontend Architecture And Flow

This document explains how the `Frontend` app works based on the current codebase. The app is a Vite React single page application named Interlix. It uses React 19, React Router 7, Axios, Tailwind CSS 4, and custom CSS variables/utilities from `Frontend/src/index.css`.

Generated files in `Frontend/dist` and installed packages in `Frontend/node_modules` are not part of this source analysis.

## High-Level Structure

- `Frontend/index.html` provides the HTML shell, favicon, viewport metadata, title `Interlix`, and the `#root` element.
- `Frontend/src/main.jsx` mounts React into `#root`, imports `index.css`, wraps the app in `StrictMode`, and renders `App`.
- `Frontend/src/App.jsx` composes global providers: `ToastProvider`, `AuthProvider`, `AppRoutes`, and `ToastContainer`.
- `Frontend/src/app.routes.jsx` defines every route and decides which pages are public, protected, wrapped in `AppLayout`, or full-screen.
- `Frontend/src/lib/api.client.js` creates the shared Axios client with `VITE_API_BASE_URL` or `http://localhost:5000` and `withCredentials: true`.

## Startup Flow

1. The browser loads `Frontend/index.html`.
2. The module script loads `/src/main.jsx`.
3. `main.jsx` imports global CSS from `Frontend/src/index.css`.
4. `main.jsx` renders `<App />` into `document.getElementById('root')`.
5. `App.jsx` wraps the route tree with `ToastProvider` and `AuthProvider`.
6. `AuthProvider` immediately runs `bootstrapAuth` inside `useEffect`.
7. `bootstrapAuth` calls `getMe()` from `Frontend/src/features/auth/services/auth.api.js`.
8. `getMe()` sends `GET /api/auth/get-me` through `apiClient`.
9. While auth is loading, protected routes show `PageLoader`.
10. After auth resolves, `AppRoutes` renders the correct public or protected page.

## Route Flow

Routes are defined in `Frontend/src/app.routes.jsx`.

| Route | Component | Access | Layout |
| --- | --- | --- | --- |
| `/` | `Landing` | Public | No app sidebar |
| `/login` | `Login` | Public | `AuthLayout` inside page |
| `/register` | `Register` | Public | `AuthLayout` inside page |
| `/app` | `SessionsHome` | Protected | `AppLayout` |
| `/app/session/:sessionId` | `SessionDashboard` | Protected | `AppLayout` |
| `/app/session/:sessionId/interview` | `Interview` | Protected | `AppLayout` |
| `/app/session/:sessionId/aptitude` | `AptitudeTest` | Protected | Full-screen test page |
| `/app/session/:sessionId/technical` | `TechnicalTest` | Protected | Full-screen test page |
| `*` | `Navigate to "/"` | Public fallback | Redirect |

`Protected` in `Frontend/src/features/auth/components/Protected.jsx` reads `loading` and `user` from `useAuth()`. It returns `PageLoader` while loading, redirects unauthenticated users to `/login`, and renders children when a user exists.

## Auth Flow

Auth state lives in `Frontend/src/contexts/auth.context.jsx`.

`AuthProvider` owns:
- `user`: current logged-in user or `null`.
- `loading`: true while `getMe()` checks the existing cookie/session.
- `authenticating`: true while login, register, or logout is in progress.

Important functions:
- `bootstrapAuth`: runs once on mount, calls `getMe()`, stores `data.user ?? null`, and clears loading.
- `handleLogin({ email, password })`: calls `loginRequest`, stores `data.user`, and returns `{ success: true }` or `{ success: false, error }`.
- `handleRegister({ username, email, password })`: calls `registerRequest`, stores `data.user`, and returns a success/error object.
- `handleLogout()`: calls `logoutRequest`, clears `user`, and returns a success/error object.

Login page flow in `Frontend/src/features/auth/Pages/Login.jsx`:
- Local state stores `email`, `password`, `error`, `fieldErrors`, and `submitting`.
- `validate()` checks required email/password and email format.
- `handleSubmit(e)` prevents default form submission, validates fields, calls `handleLogin`, and navigates to `/app` on success.
- If `loading` is true, it shows `PageLoader`.
- If `user` exists, it redirects to `/app`.

Register page flow in `Frontend/src/features/auth/Pages/Register.jsx`:
- Local state stores `username`, `email`, `password`, `error`, `fieldErrors`, and `submitting`.
- `validate()` checks username length, email format, and password length.
- `handleSubmit(e)` calls `handleRegister` and navigates to `/app` on success.
- If already authenticated, it redirects to `/app`.

Auth API calls happen in `Frontend/src/features/auth/services/auth.api.js`:
- `register()` -> `POST /api/auth/register`
- `login()` -> `POST /api/auth/login`
- `logout()` -> `GET /api/auth/logout`
- `getMe()` -> `GET /api/auth/get-me`

## Sessions Flow

Sessions are the center of the application. A user creates a session by uploading a resume PDF, entering a job description, and entering a self description.

### Session Creation

`Frontend/src/features/sessions/pages/SessionsHome.jsx` owns the new-session form state:
- `jobDescription`
- `selfDescription`
- `resumeFile`
- `error`
- `submitting`
- `sessions`
- `loadingSessions`
- `isDragging`
- `fileInputRef`
- `dragCounterRef`

Important functions:
- `fetchSessions`: calls `getAllSessions()` to load previous sessions. In the current page file, sessions are stored but not rendered in the returned JSX.
- `processFile(file)`: accepts only PDF files and enforces a 3 MB maximum size.
- `handleFileChange(e)`: sends the selected file to `processFile`.
- `handleDragEnter(e)`, `handleDragLeave(e)`, `handleDragOver(e)`, `handleDrop(e)`: manage drag-and-drop upload state.
- `handleRemoveFile()`: clears the selected file and resets the hidden file input.
- `formatFileSize(bytes)`: formats bytes as B, KB, or MB.
- `handleAnalyzeResume()`: validates all required inputs, calls `createSession`, shows a success toast, and navigates to `/app/session/${data.session._id}`.

`createSession()` in `Frontend/src/features/sessions/services/session.api.js` sends `POST /api/session/` with `FormData` fields:
- `jobDescription`
- `selfDescription`
- `resume`

### Session Dashboard

`Frontend/src/features/sessions/pages/SessionDashboard.jsx` displays analysis results and launches tools.

State owned by `SessionDashboard`:
- `session`: loaded session object.
- `form`: editable copy of `selfDescription`, `jobDescription`, and `resume`.
- `loading`, `saving`, `error`, `pdfLoading`.

Important helpers:
- `createFormState(session)`: extracts editable fields from a session.
- `buildSessionPayload(source)`: trims `selfDescription`, `jobDescription`, and `resume`.
- `isDirty`: compares the current form payload with the saved session payload.

Important functions:
- `fetchSession`: calls `getSessionById(sessionId)` and initializes `session` and `form`.
- `handleFeatureClick(feature)`: downloads the resume PDF when feature id is `resume`; otherwise navigates to the feature path.
- `handleFieldChange(field, value)`: updates one field in `form`.
- `handleSave()`: validates editable fields, calls `updateSession`, updates local state, and tells the user generated materials were cleared.

Dashboard API calls:
- `getSessionById(sessionId)` -> `GET /api/session/:sessionId`
- `updateSession(sessionId, payload)` -> `PATCH /api/session/:sessionId`
- `generateResumePDF(sessionId)` -> `POST /api/interview/:sessionId/resume/pdf` with `responseType: "blob"`

Dashboard UI:
- `MatchScoreGauge` shows the resume match score.
- `SkillGapBadge` renders skill gap severity tags.
- `FeatureCard` renders four tool cards: interview, aptitude, technical, and resume.
- `HistoryTimeline` renders `session.history`.
- Editable textareas allow re-analysis by saving session data.

## Interview Flow

`Frontend/src/features/interview/pages/Interview.jsx` is a protected dashboard-style page inside `AppLayout`.

State:
- `activeNav`: one of `technical`, `behavioral`, or `roadmap`.
- `report`: generated or fetched interview report.
- `session`: session data for side information.
- `loading`, `generating`, `error`.

Startup behavior:
1. `fetchData` calls `getSessionById(sessionId)`.
2. It then tries `getInterviewReport(sessionId)`.
3. A `404` from `getInterviewReport` is treated as "not generated yet" rather than a fatal error.
4. Any other error becomes page error state.

Important functions:
- `handleGenerate()`: calls `generateInterviewReport(sessionId)`, stores `data.interviewReport`, and shows a toast.

User experience:
- If no report exists, the user sees a centered prompt to generate questions.
- While generating, a full-screen overlay appears.
- After generation, the page shows segmented navigation for Technical, Behavioral, and Roadmap.
- Technical and behavioral tabs render question, intention, and answer cards.
- Roadmap renders preparation plan days, focus labels, and tasks.
- A side column shows match score and skill gaps from the session.

Interview API calls in `Frontend/src/features/interview/services/interview.api.js`:
- `generateInterviewReport(sessionId)` -> `POST /api/interview/:sessionId/generate`
- `getInterviewReport(sessionId)` -> `GET /api/interview/:sessionId`
- `getSessionById(sessionId)` -> `GET /api/session/:sessionId`

## Aptitude Flow

`Frontend/src/features/aptitude/pages/AptitudeTest.jsx` is a protected full-screen test route. It is not wrapped in `AppLayout`.

State:
- `phase`: `config`, `test`, or `results`.
- `timeLimit`: selected minutes, default `15`.
- `questionCount`: selected count, default `10`.
- `generating`, `submitting`.
- `testId`, `questions`, `answers`, `currentQ`, `timeLeft`.
- `timerRef`: stores the active timer timeout.
- `result`: submitted test result.

Important functions:
- `handleSubmit`: submits answers using `submitAptitudeTest(testId, answers)`, stores result, switches to `results`, and clears timer timeout.
- Timer `useEffect`: while in test phase, decrements `timeLeft` every second. When one second remains, it sets time to zero and submits automatically.
- `formatTime(seconds)`: returns `MM:SS`.
- `handleGenerate()`: calls `generateAptitudeTest(sessionId, { timeLimit, questionCount })`, stores test id/questions, initializes answers to `-1`, sets timer, and switches to `test`.
- `handleAnswerSelect(optionIndex)`: writes the selected option index into `answers[currentQ]`.

User experience:
- Config phase lets the user choose time limit and number of questions.
- Test phase shows timer, progress bar, question navigator, options, previous/next controls, and submit button.
- Results phase shows score, pass/fail threshold based on 60 percent, navigation back to dashboard, retake, and question review with explanations.

Aptitude API calls in `Frontend/src/features/aptitude/services/aptitude.api.js`:
- `generateAptitudeTest(sessionId, { timeLimit, questionCount })` -> `POST /api/aptitude/:sessionId/generate`
- `getAptitudeTest(testId)` -> `GET /api/aptitude/:testId`
- `submitAptitudeTest(testId, answers)` -> `POST /api/aptitude/:testId/submit`

The current `AptitudeTest` page imports and uses `generateAptitudeTest` and `submitAptitudeTest`. `getAptitudeTest` is exported by the service file but not used by the current page.

## Technical Flow

`Frontend/src/features/technical/pages/TechnicalTest.jsx` is a protected full-screen test route. It is not wrapped in `AppLayout`.

State:
- `phase`: `intro`, `test`, or `results`.
- `generating`, `submitting`.
- `testId`, `questions`, `answers`, `currentQ`.
- `result`.

Important functions:
- `handleGenerate()`: calls `generateTechnicalTest(sessionId)`, stores test id/questions, initializes text answers, and switches to `test`.
- `handleAnswerChange(value)`: updates `answers[currentQ]`.
- `handleSubmit()`: calls `submitTechnicalTest(testId, answers)`, stores result, switches to `results`, and shows a toast.

User experience:
- Intro phase explains the technical test: 5 basic DSA/programming questions, fill-in-the-blank answers, no time limit.
- Test phase shows one question at a time, progress, answered count, text input, previous/next controls, and submit on the last question.
- Results phase shows score, pass/fail threshold based on 60 percent, back-to-dashboard, retake, and answer review.

Technical API calls in `Frontend/src/features/technical/services/technical.api.js`:
- `generateTechnicalTest(sessionId)` -> `POST /api/technical/:sessionId/generate`
- `getTechnicalTest(testId)` -> `GET /api/technical/:testId`
- `submitTechnicalTest(testId, answers)` -> `POST /api/technical/:testId/submit`

The current `TechnicalTest` page imports and uses `generateTechnicalTest` and `submitTechnicalTest`. `getTechnicalTest` is exported by the service file but not used by the current page.

## State Ownership

- Global auth state lives in `AuthProvider`.
- Global toast state lives in `ToastProvider`.
- Route state lives in React Router through paths and `sessionId` params.
- Sidebar collapsed state and sidebar session list live in `AppLayout`.
- Login and register form state live inside their page components.
- New session form, upload state, and creation loading state live in `SessionsHome`.
- Dashboard session data and editable form copy live in `SessionDashboard`.
- Interview report and active tab state live in `Interview`.
- Aptitude test phase, timer, answers, and result live in `AptitudeTest`.
- Technical test phase, answers, and result live in `TechnicalTest`.

## API Map

All API functions use `apiClient` from `Frontend/src/lib/api.client.js`. The client uses `baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"` and `withCredentials: true`.

| Area | Function | Method | Path | Caller |
| --- | --- | --- | --- | --- |
| Auth | `register` | POST | `/api/auth/register` | `AuthProvider.handleRegister` |
| Auth | `login` | POST | `/api/auth/login` | `AuthProvider.handleLogin` |
| Auth | `logout` | GET | `/api/auth/logout` | `AuthProvider.handleLogout` |
| Auth | `getMe` | GET | `/api/auth/get-me` | `AuthProvider.bootstrapAuth` |
| Sessions | `createSession` | POST | `/api/session/` | `SessionsHome.handleAnalyzeResume` |
| Sessions | `getSessionById` | GET | `/api/session/:sessionId` | `SessionDashboard.fetchSession`, `Interview.fetchData` |
| Sessions | `updateSession` | PATCH | `/api/session/:sessionId` | `SessionDashboard.handleSave` |
| Sessions | `getAllSessions` | GET | `/api/session/` | `AppLayout.fetchSessions`, `SessionsHome.fetchSessions` |
| Resume | `generateResumePDF` | POST | `/api/interview/:sessionId/resume/pdf` | `SessionDashboard.handleFeatureClick` |
| Interview | `generateInterviewReport` | POST | `/api/interview/:sessionId/generate` | `Interview.handleGenerate` |
| Interview | `getInterviewReport` | GET | `/api/interview/:sessionId` | `Interview.fetchData` |
| Aptitude | `generateAptitudeTest` | POST | `/api/aptitude/:sessionId/generate` | `AptitudeTest.handleGenerate` |
| Aptitude | `getAptitudeTest` | GET | `/api/aptitude/:testId` | Exported, not used in current page |
| Aptitude | `submitAptitudeTest` | POST | `/api/aptitude/:testId/submit` | `AptitudeTest.handleSubmit` |
| Technical | `generateTechnicalTest` | POST | `/api/technical/:sessionId/generate` | `TechnicalTest.handleGenerate` |
| Technical | `getTechnicalTest` | GET | `/api/technical/:testId` | Exported, not used in current page |
| Technical | `submitTechnicalTest` | POST | `/api/technical/:testId/submit` | `TechnicalTest.handleSubmit` |

## Design System

The design system is mostly defined in `Frontend/src/index.css` and applied with a mix of Tailwind utility classes, CSS custom properties, reusable utility classes, and component-level inline styles.

### Tokens

`:root` defines:
- Background colors: `--bg-primary`, `--bg-surface`, `--bg-elevated`, `--bg-hover`.
- Accent colors: `--accent-primary`, `--accent-primary-light`, `--accent-secondary`, `--accent-success`, `--accent-warning`, `--accent-danger`.
- Text colors: `--text-primary`, `--text-secondary`, `--text-muted`.
- Borders: `--border`, `--border-hover`.
- Glow colors: `--glow-purple`, `--glow-cyan`.
- Radius values: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`.
- Shadows: `--shadow-card`, `--shadow-elevated`.
- Layout sizes: `--sidebar-width`, `--sidebar-collapsed`, `--topbar-height`.

### Utility Classes

- `.glass-card`: translucent dark surface, backdrop blur, border, radius, and card shadow.
- `.glass-card-hover`: hover border/shadow lift.
- `.gradient-text`: gradient text using primary-light and secondary accents.
- `.gradient-button`: violet gradient button with hover, active, and disabled states.
- `.input-field`: shared text input style.
- `.textarea-field`: shared textarea style.
- `.upload-drop-zone`: hover behavior for resume PDF drop zone.
- Animation helpers: `.animate-fade-in`, `.animate-fade-in-up`, `.animate-slide-in-left`, `.animate-count-up`, `.animate-shimmer`, `.stagger-children`, `.toast-enter`, `.toast-exit`, and others.

### Main UI Patterns

- Public landing page: fixed blurred navbar, large hero, glass-card feature sections, gradient CTAs.
- Auth pages: split layout from `AuthLayout`; desktop left brand panel and right form panel; mobile compact header.
- App pages: fixed sidebar from `AppLayout`, collapsible width, session history, user avatar, logout, and main content column.
- Dashboard: score gauge, skill gap chips, feature cards, history timeline, editable form.
- Interview: segmented tab control, question cards, roadmap cards, session summary side column.
- Aptitude test: full-screen testing surface with config card, timer, question navigator, progress bar, option buttons, and review cards.
- Technical test: full-screen testing surface with intro card, progress bar, text input answer field, and review cards.
- Feedback: `ToastContainer`, inline error banners, `PageLoader`, `Spinner`, and full-screen loading overlays.

## User Perspective Flow

1. A visitor lands on `/` and sees the Interlix marketing page with Login and Get Started links.
2. A new user registers on `/register`; an existing user signs in on `/login`.
3. After auth succeeds, the user enters `/app`.
4. On `/app`, the user creates a session by entering a job description, uploading a PDF resume, and writing a self description.
5. The frontend sends the form data to `POST /api/session/` and navigates to the new session dashboard.
6. The dashboard shows resume match score, skill gaps, session history, editable source data, and tool cards.
7. The user can generate interview preparation, take an aptitude test, take a technical test, or download an AI resume PDF.
8. Interview preparation stays inside the sidebar layout.
9. Aptitude and technical tests switch to full-screen focused testing pages.
10. Results and history feed back into the session-centered workflow through dashboard navigation and generated session data.

## Where To Change Things

- Routes: `Frontend/src/app.routes.jsx`
- Auth state and auth API calls: `Frontend/src/contexts/auth.context.jsx` and `Frontend/src/features/auth/services/auth.api.js`
- Protected route behavior: `Frontend/src/features/auth/components/Protected.jsx`
- API base URL: `Frontend/src/lib/api.client.js`
- Session creation form: `Frontend/src/features/sessions/pages/SessionsHome.jsx`
- Dashboard and tool launch behavior: `Frontend/src/features/sessions/pages/SessionDashboard.jsx`
- Interview generation UI: `Frontend/src/features/interview/pages/Interview.jsx`
- Aptitude test UI and timer: `Frontend/src/features/aptitude/pages/AptitudeTest.jsx`
- Technical test UI: `Frontend/src/features/technical/pages/TechnicalTest.jsx`
- Design tokens and shared utility classes: `Frontend/src/index.css`
- Sidebar layout: `Frontend/src/layouts/AppLayout.jsx`
- Auth screen layout: `Frontend/src/layouts/AuthLayout.jsx`
- Toast behavior: `Frontend/src/contexts/toast.context.jsx` and `Frontend/src/components/Toast.jsx`
