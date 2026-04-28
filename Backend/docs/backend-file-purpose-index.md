# Backend File Purpose Index

This file explains every important backend file in the current `Backend` folder. It ignores dependency folders such as `node_modules`.

## Root Backend Files

### `Backend/package.json`

Defines the backend package, scripts, and dependencies.

Scripts:

- `start`: runs `node server.js`.
- `dev`: runs `nodemon server.js`.
- `test`: runs Node's built-in test runner with `node --test`.

Important dependencies:

- `express`: HTTP API server.
- `mongoose`: MongoDB modeling and connection.
- `dotenv`: environment variable loading.
- `cors`: CORS middleware.
- `cookie-parser`: parses cookies into `req.cookies`.
- `jsonwebtoken`: signs and verifies JWTs.
- `bcryptjs`: password hashing and comparison.
- `multer`: file upload middleware.
- `pdf-parse`: extracts text from uploaded PDF buffers.
- `@langchain/google-genai` and `@langchain/core`: Google GenAI integration through LangChain.
- `zod`: structured AI output schemas.
- `puppeteer`: renders HTML to PDF.

### `Backend/package-lock.json`

NPM lockfile for exact dependency versions.

### `Backend/README.md`

Backend readme file. It is not imported by the runtime code.

### `Backend/server.js`

Runtime entry point.

Purpose:

- Loads environment variables with `dotenv`.
- Imports the Express app from `./src/app`.
- Imports `connectDB` from `./src/config/database`.
- Connects to MongoDB before starting the server.
- Reads `process.env.PORT || 3000`.
- Logs successful startup.
- Exits the process if database connection fails.

Important flow:

`connectDB().then(() => app.listen(PORT)).catch(() => process.exit(1))`

## App And Config

### `Backend/src/app.js`

Creates and configures the Express application.

Middleware:

- `express.json()`
- `cookieParser()`
- `cors({ origin, credentials: true })`

CORS behavior:

- Defaults allowed origins to `http://localhost:5173` and `http://localhost:5174`.
- If `process.env.CORS_ALLOWED_ORIGINS` exists, it splits the comma-separated value.
- Allows requests with no `origin`.
- Rejects unlisted origins with `new Error("Not allowed by CORS")`.

Mounted routers:

- `/api/auth` -> `Backend/src/routes/auth.routes.js`
- `/api/session` -> `Backend/src/routes/session.routes.js`
- `/api/interview` -> `Backend/src/routes/interview.routes.js`
- `/api/aptitude` -> `Backend/src/routes/aptitude.routes.js`
- `/api/technical` -> `Backend/src/routes/technical.routes.js`

Fallback:

- Unmatched routes return status `404` with `{ message: "Route not found" }`.

### `Backend/src/config/database.js`

MongoDB connection helper.

Exports:

- `connectDB`

Purpose:

- Calls `mongoose.connect(process.env.MONGO_URI)`.
- Logs success.
- Logs and rethrows connection errors so `server.js` can stop startup.

## Routes

### `Backend/src/routes/auth.routes.js`

Auth router mounted at `/api/auth`.

Routes:

- `POST /register` -> `authController.registerUserController`
- `POST /login` -> `authController.loginUserController`
- `GET /logout` -> `authController.logoutUserController`
- `GET /get-me` -> `authMiddleware.authUser`, then `authController.getMeController`

Full paths:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/logout`
- `GET /api/auth/get-me`

### `Backend/src/routes/session.routes.js`

Session router mounted at `/api/session`.

Routes:

- `POST /` -> `authUser`, `upload.single("resume")`, `createSessionController`
- `GET /:sessionId` -> `authUser`, `getSessionByIdController`
- `PATCH /:sessionId` -> `authUser`, `updateSessionController`
- `GET /` -> `authUser`, `getAllSessionsController`

Full paths:

- `POST /api/session/`
- `GET /api/session/:sessionId`
- `PATCH /api/session/:sessionId`
- `GET /api/session/`

### `Backend/src/routes/interview.routes.js`

Interview router mounted at `/api/interview`.

Routes:

- `POST /:sessionId/generate` -> `authUser`, `generateInterviewController`
- `GET /:sessionId` -> `authUser`, `getInterviewBySessionController`
- `POST /:sessionId/resume/pdf` -> `authUser`, `generateResumePDFController`

Full paths:

- `POST /api/interview/:sessionId/generate`
- `GET /api/interview/:sessionId`
- `POST /api/interview/:sessionId/resume/pdf`

### `Backend/src/routes/aptitude.routes.js`

Aptitude router mounted at `/api/aptitude`.

Routes:

- `POST /:sessionId/generate` -> `authUser`, `generateAptitudeTestController`
- `GET /:testId` -> `authUser`, `getAptitudeTestController`
- `POST /:testId/submit` -> `authUser`, `submitAptitudeTestController`

Full paths:

- `POST /api/aptitude/:sessionId/generate`
- `GET /api/aptitude/:testId`
- `POST /api/aptitude/:testId/submit`

### `Backend/src/routes/technical.routes.js`

Technical router mounted at `/api/technical`.

Routes:

- `POST /:sessionId/generate` -> `authUser`, `generateTechnicalTestController`
- `GET /:testId` -> `authUser`, `getTechnicalTestController`
- `POST /:testId/submit` -> `authUser`, `submitTechnicalTestController`

Full paths:

- `POST /api/technical/:sessionId/generate`
- `GET /api/technical/:testId`
- `POST /api/technical/:testId/submit`

## Controllers

### `Backend/src/controllers/auth.controller.js`

Handles registration, login, logout, and get-me.

Imports:

- `userModel`
- `bcrypt`
- `jsonwebtoken`
- `crypto`
- `tokenBlacklistModel`

Constants:

- `COOKIE_OPTIONS`: HTTP-only auth cookie options with 1-day max age.

Helper functions:

- `isValidEmail(email)`: validates email format with regex.
- `normalizeEmail(email)`: trims and lowercases string emails.
- `normalizeUsername(username)`: trims string usernames.
- `createAuthToken(user)`: signs a JWT with user id, username, random tokenId, `JWT_SECRET`, and 1-day expiry.

Controller functions:

- `registerUserController(req, res)`: validates input, checks duplicate username/email, hashes password, creates user, sets JWT cookie, and returns public user fields.
- `loginUserController(req, res)`: validates input, finds user by email, compares password, sets JWT cookie, and returns public user fields.
- `logoutUserController(req, res)`: reads cookie token, stores it in blacklist if present, clears cookie, and returns success.
- `getMeController(req, res)`: uses `req.user.id`, loads user by id, and returns public user fields.

### `Backend/src/controllers/session.controller.js`

Handles resume analysis sessions.

Imports:

- `pdf-parse`
- `mongoose`
- `analyzeResume`
- `sessionModel`
- `interviewReportModel`
- `aptitudeTestModel`
- `technicalTestModel`
- `prependHistoryEntry`

Helper functions:

- `normalizeText(value)`: trims strings or returns empty string.
- `isValidSessionId(sessionId)`: validates Mongo ObjectId.
- `findOwnedSession(sessionId, userId)`: finds a session by id and user.
- `invalidateGeneratedArtifacts(sessionId, userId)`: deletes interview reports, aptitude tests, and technical tests for that session/user.

Controller functions:

- `createSessionController(req, res)`: requires uploaded PDF buffer, parses PDF text, validates descriptions, calls AI analysis, creates a session with initial history, and returns it.
- `getSessionByIdController(req, res)`: validates id, finds owned session, and returns it.
- `updateSessionController(req, res)`: validates edited resume/self/job text, re-runs AI analysis, updates session, clears cached resume HTML, prepends history, invalidates generated artifacts, and returns updated session.
- `getAllSessionsController(req, res)`: returns all sessions for the logged-in user, sorted newest first, excluding large fields.

### `Backend/src/controllers/interview.controller.js`

Handles interview reports and resume PDF generation.

Imports:

- `mongoose`
- `generateInterviewReport`
- `generateResumePDF`
- `interviewReportModel`
- `sessionModel`
- `prependHistoryEntry`

Controller functions:

- `generateInterviewController(req, res)`: validates session id, finds owned session, reuses an existing report if found, otherwise calls AI service, creates report, prepends history, and returns report.
- `getInterviewBySessionController(req, res)`: validates session id, finds report by session/user, and returns it or 404.
- `generateResumePDFController(req, res)`: validates session id, finds owned session, calls AI/PDF service, caches returned HTML when changed, prepends history, sets PDF headers, and sends the PDF buffer.

### `Backend/src/controllers/aptitude.controller.js`

Handles aptitude test generation, retrieval, and scoring.

Imports:

- `mongoose`
- `generateAptitudeQuestions`
- `aptitudeTestModel`
- `sessionModel`
- `prependHistoryEntry`

Controller functions:

- `generateAptitudeTestController(req, res)`: validates session id, time limit, and question count; finds owned session; calls AI service; creates an aptitude test; prepends history; returns a safe test without correct answers/explanations.
- `getAptitudeTestController(req, res)`: validates test id, finds owned test, hides correct answers/explanations if not submitted, and returns full data after submission.
- `submitAptitudeTestController(req, res)`: validates answer array, prevents resubmission, validates answer indexes, stores user answers, calculates score, marks submitted, sets completedAt, saves, and returns full scored test.

### `Backend/src/controllers/technical.controller.js`

Handles technical short-answer test generation, retrieval, and scoring.

Imports:

- `mongoose`
- `generateTechnicalDSAQuestions`
- `technicalTestModel`
- `sessionModel`
- `prependHistoryEntry`

Controller functions:

- `generateTechnicalTestController(req, res)`: validates session id, finds owned session, calls AI service, creates technical test with blank user answers, prepends history, and returns safe questions without correct answers/explanations.
- `getTechnicalTestController(req, res)`: validates test id, finds owned test, hides correct answers/explanations before submission, and returns full data after submission.
- `submitTechnicalTestController(req, res)`: validates answer array, prevents resubmission, checks answer types, compares trimmed/lowercased answers to correct answers, scores test, marks submitted, sets completedAt, saves, and returns scored test.

## Models

### `Backend/src/models/user.model.js`

Exports:

- `userModel`

Mongoose model name:

- `users`

Fields:

- `username`: required unique string.
- `email`: required unique string.
- `password`: required string.

Purpose:

- Stores registered users and hashed passwords.

### `Backend/src/models/blacklist.model.js`

Exports:

- `tokenBlacklistModel`

Mongoose model name:

- `blacklistTokens`

Fields:

- `token`: required string.
- timestamps.

Purpose:

- Stores logged-out JWTs so `authUser` can reject them before JWT verification.

### `Backend/src/models/session.model.js`

Exports:

- `sessionModel`

Mongoose model name:

- `Session`

Embedded schemas:

- `skillGapSchema`: `{ skill, severity }`, where severity is `low`, `medium`, or `high`.
- `sessionHistorySchema`: `{ type, label, detail, createdAt }`.

Fields:

- `user`: ObjectId ref to `users`.
- `resume`: extracted resume text.
- `jobDescription`: target job text.
- `selfDescription`: candidate self description.
- `title`: AI generated title.
- `matchScore`: number from 0 to 100.
- `skillGaps`: array of skill gaps.
- `refinedResumeHtml`: cached generated resume HTML.
- `history`: session history entries.
- timestamps.

Purpose:

- Central parent record for all generated materials.

### `Backend/src/models/interviewReport.model.js`

Exports:

- `interviewReportModel`

Mongoose model name:

- `InterviewReport`

Embedded schemas:

- `technicalQuestionSchema`: `{ question, intention, answer }`.
- `behavioralQuestionSchema`: `{ question, intention, answer }`.
- `preparationPlanSchema`: `{ day, focus, tasks }`.

Fields:

- `session`: ObjectId ref to `Session`.
- `user`: ObjectId ref to `users`.
- `technicalQuestions`
- `behavioralQuestions`
- `preparationPlan`
- timestamps.

Purpose:

- Stores generated interview preparation content for one session/user.

### `Backend/src/models/aptitudeTest.model.js`

Exports:

- `aptitudeTestModel`

Mongoose model name:

- `AptitudeTest`

Embedded question fields:

- `question`
- `options`
- `correctAnswer`
- `userAnswer`
- `explanation`

Top-level fields:

- `session`
- `user`
- `timeLimit`
- `totalQuestions`
- `questions`
- `score`
- `submitted`
- `completedAt`
- timestamps.

Purpose:

- Stores generated MCQ tests and submitted answer state.

### `Backend/src/models/technicalTest.model.js`

Exports:

- `technicalTestModel`

Mongoose model name:

- `TechnicalTest`

Embedded question fields:

- `question`
- `correctAnswer`
- `userAnswer`
- `isCorrect`
- `explanation`
- `difficulty`

Top-level fields:

- `session`
- `user`
- `questions`
- `score`
- `submitted`
- `completedAt`
- timestamps.

Purpose:

- Stores generated short-answer technical tests and scoring state.

## Middleware

### `Backend/src/middlewares/auth.middleware.js`

Exports:

- `authUser`

Purpose:

- Protects private routes.

Behavior:

1. Reads `req.cookies.token`.
2. Returns `401` if missing.
3. Checks `tokenBlacklistModel` for the token.
4. Returns `401` if token is blacklisted.
5. Verifies token with `jwt.verify(token, process.env.JWT_SECRET)`.
6. Stores decoded payload in `req.user`.
7. Calls `next()`.
8. Returns `401` on verification or middleware errors.

### `Backend/src/middlewares/file.middleware.js`

Exports:

- `upload`

Purpose:

- Configures multer for resume PDF upload.

Behavior:

- Uses `multer.memoryStorage()`.
- Limits file size to 3 MB.
- Accepts only `application/pdf`.
- Used by `session.routes.js` as `upload.single("resume")`.

## Services

### `Backend/src/services/ai.service.js`

Central AI and PDF service.

Imports:

- `ChatGoogleGenerativeAI`
- `z`
- `puppeteer`

Constants:

- `DEFAULT_AI_MODEL = "gemini-2.5-flash"`
- `PREPARATION_PLAN_DAYS = 7`
- `TECHNICAL_QUESTION_COUNT = 5`
- `SKILL_GAP_SEVERITIES = new Set(["low", "medium", "high"])`

Model setup:

- `getModel()`: requires `GOOGLE_GENAI_API_KEY`, uses `GOOGLE_GENAI_MODEL` or default, and returns `ChatGoogleGenerativeAI`.

Normalization helpers:

- `normalizeLine(value)`
- `normalizeTextBlock(value)`
- `normalizeMatchScore(value)`
- `normalizeSkillGaps(skillGaps)`
- `normalizeInterviewQuestions(questions)`
- `normalizePreparationPlan(plan)`
- `normalizeAptitudeQuestions(questions, questionCount)`
- `normalizeTechnicalQuestions(questions, questionCount)`
- `sanitizeHtmlDocument(htmlContent)`

Structured AI helper:

- `invokeStructuredModel({ schema, name, prompt, purpose })`: wraps `getModel().withStructuredOutput(schema, { name }).invoke(prompt)`.

Zod schemas:

- `resumeAnalysisSchema`
- `interviewReportSchema`
- `aptitudeQuestionsSchema`
- `technicalDSASchema`
- local `resumePdfSchema` inside `generateResumeHtml`

Exported service functions:

- `analyzeResume({ resume, selfDescription, jobDescription })`: returns normalized title, match score, and skill gaps.
- `generateInterviewReport({ resume, selfDescription, jobDescription })`: returns technical questions, behavioral questions, and 7-day plan.
- `generateAptitudeQuestions({ resume, jobDescription, count })`: returns validated MCQs.
- `generateTechnicalDSAQuestions({ resume, jobDescription })`: returns 5 validated short-answer technical questions.
- `generateResumePDF({ resume, selfDescription, jobDescription, html })`: reuses or generates resume HTML, renders PDF, and returns `{ html, pdfBuffer }`.

Internal PDF functions:

- `generateResumeHtml({ resume, selfDescription, jobDescription })`: asks AI for resume HTML and sanitizes it.
- `generatePDFFromHTML(htmlContent)`: launches Puppeteer, sets HTML content, exports A4 PDF, and closes the browser.

## Utilities

### `Backend/src/utils/session-history.js`

Exports:

- `prependHistoryEntry(session, entry)`

Purpose:

- Adds a new history entry to the beginning of `session.history`.
- Sets `createdAt` to the current time.
- Defaults missing detail to empty string.
- Keeps only the newest 20 entries.

Used by:

- `session.controller.js`
- `interview.controller.js`
- `aptitude.controller.js`
- `technical.controller.js`

## Endpoint To Data Flow Summary

| Feature | Route | Main Controller | Main Models | Main Service |
| --- | --- | --- | --- | --- |
| Register | `POST /api/auth/register` | `registerUserController` | `userModel` | bcrypt/JWT helpers |
| Login | `POST /api/auth/login` | `loginUserController` | `userModel` | bcrypt/JWT helpers |
| Logout | `GET /api/auth/logout` | `logoutUserController` | `tokenBlacklistModel` | Cookie clear |
| Get me | `GET /api/auth/get-me` | `getMeController` | `userModel` | `authUser` middleware |
| Create session | `POST /api/session/` | `createSessionController` | `sessionModel` | `pdf-parse`, `analyzeResume` |
| Get session | `GET /api/session/:sessionId` | `getSessionByIdController` | `sessionModel` | None |
| Update session | `PATCH /api/session/:sessionId` | `updateSessionController` | `sessionModel`, generated artifact models | `analyzeResume` |
| List sessions | `GET /api/session/` | `getAllSessionsController` | `sessionModel` | None |
| Generate interview | `POST /api/interview/:sessionId/generate` | `generateInterviewController` | `sessionModel`, `interviewReportModel` | `generateInterviewReport` |
| Get interview | `GET /api/interview/:sessionId` | `getInterviewBySessionController` | `interviewReportModel` | None |
| Generate resume PDF | `POST /api/interview/:sessionId/resume/pdf` | `generateResumePDFController` | `sessionModel` | `generateResumePDF` |
| Generate aptitude | `POST /api/aptitude/:sessionId/generate` | `generateAptitudeTestController` | `sessionModel`, `aptitudeTestModel` | `generateAptitudeQuestions` |
| Get aptitude | `GET /api/aptitude/:testId` | `getAptitudeTestController` | `aptitudeTestModel` | None |
| Submit aptitude | `POST /api/aptitude/:testId/submit` | `submitAptitudeTestController` | `aptitudeTestModel` | Scoring logic |
| Generate technical | `POST /api/technical/:sessionId/generate` | `generateTechnicalTestController` | `sessionModel`, `technicalTestModel` | `generateTechnicalDSAQuestions` |
| Get technical | `GET /api/technical/:testId` | `getTechnicalTestController` | `technicalTestModel` | None |
| Submit technical | `POST /api/technical/:testId/submit` | `submitTechnicalTestController` | `technicalTestModel` | Scoring logic |

## Learning Summary

The backend is a protected API around interview preparation sessions. Auth creates a JWT cookie. Private routes use `authUser` to decode that cookie and attach the logged-in user to `req.user`. Session routes create and manage resume-analysis sessions. Interview, aptitude, technical, and resume PDF features all start from an owned session, call AI or scoring logic, save results in MongoDB, and update session history.

The most important idea is the ownership chain: controllers almost always query by both resource id and `req.user.id`. That keeps users from reading or changing another user's sessions or tests.
