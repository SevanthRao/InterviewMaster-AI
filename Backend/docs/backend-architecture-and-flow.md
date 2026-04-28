# Backend Architecture And Flow

This document explains the current `Backend` folder as source-based learning documentation. It covers only the backend code.

## 1. Project Structure

The backend is an Express 5 API using MongoDB through Mongoose. It uses cookie-based JWT authentication, multer for resume PDF uploads, LangChain Google GenAI for AI generation, `pdf-parse` for extracting uploaded resume text, and Puppeteer for rendering refined resume HTML into PDF.

Important folders and files:

- `Backend/server.js`: loads environment variables, connects to MongoDB, and starts the HTTP server.
- `Backend/src/app.js`: creates the Express app, configures middleware, mounts routers, and defines the 404 fallback.
- `Backend/src/config/database.js`: connects Mongoose to `process.env.MONGO_URI`.
- `Backend/src/routes/*.routes.js`: defines feature routers.
- `Backend/src/controllers/*.controller.js`: validates requests, performs ownership checks, calls services/models, and sends responses.
- `Backend/src/models/*.model.js`: defines Mongoose schemas and models.
- `Backend/src/middlewares/auth.middleware.js`: protects private routes by reading and verifying the JWT cookie.
- `Backend/src/middlewares/file.middleware.js`: configures multer for in-memory PDF resume upload.
- `Backend/src/services/ai.service.js`: handles Google GenAI structured output and PDF generation.
- `Backend/src/utils/session-history.js`: prepends capped history entries to sessions.

## 2. Server Startup Flow

Startup begins in `Backend/server.js`.

1. `require("dotenv").config()` loads environment variables.
2. The Express app is imported from `./src/app`.
3. `connectDB` is imported from `./src/config/database`.
4. `connectDB()` calls `mongoose.connect(process.env.MONGO_URI)`.
5. If MongoDB connects, `server.js` reads `process.env.PORT || 3000`.
6. `app.listen(PORT)` starts the server.
7. If the database connection fails, the catch block logs the error and calls `process.exit(1)`.

`Backend/src/app.js` creates the request pipeline:

1. `express.json()` parses JSON request bodies.
2. `cookieParser()` parses cookies into `req.cookies`.
3. `cors()` allows configured origins and credentials.
4. Feature routers are mounted:
   - `/api/auth`
   - `/api/session`
   - `/api/interview`
   - `/api/aptitude`
   - `/api/technical`
5. A final 404 middleware returns `{ message: "Route not found" }`.

Default CORS origins in `Backend/src/app.js` are `http://localhost:5173` and `http://localhost:5174`. If `CORS_ALLOWED_ORIGINS` is set, it is split by comma and used instead.

## 3. Route Map

All routes below are built by combining the mount path in `Backend/src/app.js` with each route file path.

| Method | Full Path | Route File | Middleware | Controller | Purpose |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | `auth.routes.js` | None | `registerUserController` | Register user and set auth cookie |
| POST | `/api/auth/login` | `auth.routes.js` | None | `loginUserController` | Login user and set auth cookie |
| GET | `/api/auth/logout` | `auth.routes.js` | None | `logoutUserController` | Clear auth cookie and blacklist current token |
| GET | `/api/auth/get-me` | `auth.routes.js` | `authUser` | `getMeController` | Return logged-in user details |
| POST | `/api/session/` | `session.routes.js` | `authUser`, `upload.single("resume")` | `createSessionController` | Upload PDF, analyze resume, create session |
| GET | `/api/session/:sessionId` | `session.routes.js` | `authUser` | `getSessionByIdController` | Fetch one owned session |
| PATCH | `/api/session/:sessionId` | `session.routes.js` | `authUser` | `updateSessionController` | Update editable session data and re-analyze |
| GET | `/api/session/` | `session.routes.js` | `authUser` | `getAllSessionsController` | Fetch all sessions for logged-in user |
| POST | `/api/interview/:sessionId/generate` | `interview.routes.js` | `authUser` | `generateInterviewController` | Generate or reuse interview report |
| GET | `/api/interview/:sessionId` | `interview.routes.js` | `authUser` | `getInterviewBySessionController` | Fetch interview report |
| POST | `/api/interview/:sessionId/resume/pdf` | `interview.routes.js` | `authUser` | `generateResumePDFController` | Generate and return resume PDF |
| POST | `/api/aptitude/:sessionId/generate` | `aptitude.routes.js` | `authUser` | `generateAptitudeTestController` | Generate aptitude test |
| GET | `/api/aptitude/:testId` | `aptitude.routes.js` | `authUser` | `getAptitudeTestController` | Fetch aptitude test |
| POST | `/api/aptitude/:testId/submit` | `aptitude.routes.js` | `authUser` | `submitAptitudeTestController` | Submit aptitude answers and score |
| POST | `/api/technical/:sessionId/generate` | `technical.routes.js` | `authUser` | `generateTechnicalTestController` | Generate technical short-answer test |
| GET | `/api/technical/:testId` | `technical.routes.js` | `authUser` | `getTechnicalTestController` | Fetch technical test |
| POST | `/api/technical/:testId/submit` | `technical.routes.js` | `authUser` | `submitTechnicalTestController` | Submit technical answers and score |
| Any | unmatched route | `app.js` | None | inline 404 handler | Return route-not-found JSON |

## 4. Auth Flow

Auth code lives in `Backend/src/controllers/auth.controller.js`, `Backend/src/middlewares/auth.middleware.js`, `Backend/src/models/user.model.js`, and `Backend/src/models/blacklist.model.js`.

### Cookie And JWT Creation

`createAuthToken(user)` in `auth.controller.js` signs a JWT with:

- `id: user._id`
- `username: user.username`
- `tokenId: crypto.randomUUID()`

It uses `process.env.JWT_SECRET` and expires in `1d`.

`COOKIE_OPTIONS` sets:

- `httpOnly: true`
- `sameSite: "lax"`
- `secure: process.env.NODE_ENV === "production"`
- `maxAge: 24 * 60 * 60 * 1000`

Register and login both set the token cookie named `token`.

### Register

Route: `POST /api/auth/register`

Controller: `registerUserController`

Flow:

1. Normalizes username and email with `normalizeUsername` and `normalizeEmail`.
2. Validates required username, email, and password.
3. Validates email format with `isValidEmail`.
4. Requires password length of at least 6.
5. Requires username length of at least 3.
6. Checks for an existing user with the same username or email.
7. Hashes password with `bcrypt.hash(password, 10)`.
8. Creates a user through `userModel.create`.
9. Creates JWT with `createAuthToken`.
10. Sets the cookie and returns the public user object.

### Login

Route: `POST /api/auth/login`

Controller: `loginUserController`

Flow:

1. Normalizes email.
2. Validates required email/password and email format.
3. Finds user by email.
4. Compares password with `bcrypt.compare`.
5. Creates and sets JWT cookie.
6. Returns public user data.

### Logout

Route: `GET /api/auth/logout`

Controller: `logoutUserController`

Flow:

1. Reads `req.cookies.token`.
2. If token exists, writes it to `tokenBlacklistModel`.
3. Clears the `token` cookie.
4. Returns success.

The blacklist model stores full token strings with timestamps. There is no TTL behavior visible in the current schema.

### Get Me

Route: `GET /api/auth/get-me`

Middleware: `authUser`

Controller: `getMeController`

Flow:

1. `authUser` verifies the cookie and assigns `req.user`.
2. Controller loads the user by `req.user.id`.
3. If found, returns public user data.

### Auth Middleware

`authUser` in `Backend/src/middlewares/auth.middleware.js`:

1. Reads `req.cookies.token`.
2. Returns `401` if no token exists.
3. Checks `tokenBlacklistModel.findOne({ token })`.
4. Returns `401` if blacklisted.
5. Verifies token with `jwt.verify(token, process.env.JWT_SECRET)`.
6. Assigns decoded payload to `req.user`.
7. Calls `next()`.
8. On verification errors, returns `401`.

## 5. Session Flow

Sessions are created from a resume PDF, job description, and self description. Session routes are protected and require `authUser`.

### Create Session

Route: `POST /api/session/`

Middleware:

- `authUser`
- `upload.single("resume")`

Controller: `createSessionController`

Flow:

1. Checks `req.file.buffer` exists.
2. Normalizes `selfDescription` and `jobDescription`.
3. Requires job description and self description.
4. Parses PDF buffer with `pdfParse(req.file.buffer)`.
5. Normalizes extracted resume text.
6. Requires non-empty extracted resume text.
7. Calls `analyzeResume({ resume, selfDescription, jobDescription })`.
8. Creates `sessionModel` with:
   - `user: req.user.id`
   - extracted `resume`
   - `selfDescription`
   - `jobDescription`
   - AI `title`
   - AI `matchScore`
   - AI `skillGaps`
   - initial `history` entry of type `session_created`
9. Returns `201` with the session.

If PDF parsing fails, it returns `400`. If AI analysis fails with the expected service error message, it returns `502`.

### Get Session By ID

Route: `GET /api/session/:sessionId`

Controller: `getSessionByIdController`

Flow:

1. Validates ObjectId with `isValidSessionId`.
2. Calls `findOwnedSession(sessionId, req.user.id)`.
3. Returns `404` if no owned session exists.
4. Returns the session.

### Update Session

Route: `PATCH /api/session/:sessionId`

Controller: `updateSessionController`

Flow:

1. Validates ObjectId.
2. Normalizes `resume`, `selfDescription`, and `jobDescription`.
3. Requires all three fields.
4. Loads owned session.
5. Calls `analyzeResume` again with edited data.
6. Updates session source fields, title, match score, skill gaps, and clears `refinedResumeHtml`.
7. Prepends a `session_updated` history entry.
8. Saves the session.
9. Calls `invalidateGeneratedArtifacts(sessionId, req.user.id)`.
10. Returns updated session.

`invalidateGeneratedArtifacts` deletes generated interview reports, aptitude tests, and technical tests for the session/user. This keeps regenerated session analysis from reusing old generated material.

### Get All Sessions

Route: `GET /api/session/`

Controller: `getAllSessionsController`

Flow:

1. Finds sessions where `user: req.user.id`.
2. Sorts newest first with `.sort({ createdAt: -1 })`.
3. Excludes heavy/sensitive fields with `.select("-resume -selfDescription -jobDescription -refinedResumeHtml -__v")`.
4. Returns the session list.

## 6. Interview And Resume PDF Flow

Interview routes are protected by `authUser`.

### Generate Interview Report

Route: `POST /api/interview/:sessionId/generate`

Controller: `generateInterviewController`

Flow:

1. Validates `sessionId`.
2. Finds the owned session with `_id` and `user`.
3. Checks if an `interviewReportModel` already exists for the session/user.
4. If it exists:
   - prepends `interview_report_reused` history
   - saves session
   - returns the existing report with status `200`
5. If no report exists:
   - calls `generateInterviewReport` from `ai.service.js`
   - creates an `InterviewReport`
   - prepends `interview_report_generated` history
   - saves session
   - returns the new report with status `201`

### Get Interview Report

Route: `GET /api/interview/:sessionId`

Controller: `getInterviewBySessionController`

Flow:

1. Validates `sessionId`.
2. Finds report by `session` and `user`.
3. Returns `404` if not generated yet.
4. Returns the report.

### Generate Resume PDF

Route: `POST /api/interview/:sessionId/resume/pdf`

Controller: `generateResumePDFController`

Flow:

1. Validates `sessionId`.
2. Finds owned session.
3. Calls `generateResumePDF` from `ai.service.js` with resume, self description, job description, and cached `session.refinedResumeHtml`.
4. If returned HTML differs from stored HTML, updates `session.refinedResumeHtml`.
5. Prepends `resume_generated` history.
6. Saves the session.
7. Sets `Content-Type: application/pdf`.
8. Sets `Content-Disposition: attachment; filename=resume_${sessionId}.pdf`.
9. Sends `resumeDocument.pdfBuffer`.

## 7. Aptitude Flow

Aptitude routes are protected by `authUser`.

### Generate Aptitude Test

Route: `POST /api/aptitude/:sessionId/generate`

Controller: `generateAptitudeTestController`

Flow:

1. Reads `timeLimit` and `questionCount` from `req.body`.
2. Converts them with `Number`.
3. Validates `sessionId`.
4. Requires integer time limit between 5 and 60.
5. Requires integer question count between 5 and 30.
6. Finds owned session.
7. Calls `generateAptitudeQuestions({ resume, jobDescription, count })`.
8. Adds `userAnswer: -1` to every generated question.
9. Creates `aptitudeTestModel` with session, user, time limit, total question count, and questions.
10. Prepends `aptitude_generated` history to the session and saves it.
11. Returns a safe test object that includes question text, options, and userAnswer, but hides `correctAnswer` and `explanation`.

### Get Aptitude Test

Route: `GET /api/aptitude/:testId`

Controller: `getAptitudeTestController`

Flow:

1. Validates `testId`.
2. Finds test by `_id` and `user`.
3. Returns `404` if missing.
4. If not submitted, returns a safe version that hides correct answers and explanations.
5. If submitted, returns the full test document.

### Submit Aptitude Test

Route: `POST /api/aptitude/:testId/submit`

Controller: `submitAptitudeTestController`

Flow:

1. Validates `testId`.
2. Requires `answers` to be an array.
3. Finds test by `_id` and `user`.
4. Rejects missing tests and already-submitted tests.
5. Rejects answer arrays longer than the test question count.
6. Validates each non-empty answer as an integer from 0 to 3.
7. Iterates over test questions.
8. Converts each answer to a number, defaulting missing answers to `-1`.
9. Stores `q.userAnswer`.
10. Increments score when `userAnswer === q.correctAnswer`.
11. Sets `score`, `submitted: true`, and `completedAt`.
12. Saves and returns the full scored test.

## 8. Technical Flow

Technical routes are protected by `authUser`.

### Generate Technical Test

Route: `POST /api/technical/:sessionId/generate`

Controller: `generateTechnicalTestController`

Flow:

1. Validates `sessionId`.
2. Finds owned session.
3. Calls `generateTechnicalDSAQuestions({ resume, jobDescription })`.
4. Adds `userAnswer: ""` and `isCorrect: null` to every question.
5. Creates `technicalTestModel`.
6. Prepends `technical_generated` history to the session and saves it.
7. Returns a safe test object that includes question, difficulty, and userAnswer, but hides `correctAnswer` and `explanation`.

### Get Technical Test

Route: `GET /api/technical/:testId`

Controller: `getTechnicalTestController`

Flow:

1. Validates `testId`.
2. Finds test by `_id` and `user`.
3. Returns `404` if missing.
4. If not submitted, returns safe questions only.
5. If submitted, returns the full test document.

### Submit Technical Test

Route: `POST /api/technical/:testId/submit`

Controller: `submitTechnicalTestController`

Flow:

1. Validates `testId`.
2. Requires `answers` to be an array.
3. Finds owned test.
4. Rejects missing tests and already-submitted tests.
5. Rejects answer arrays longer than the question count.
6. Requires each provided answer to be a string.
7. Compares each answer to `q.correctAnswer` using trimmed, lowercased strings.
8. Stores raw answer in `q.userAnswer`.
9. Sets `q.isCorrect`.
10. Increments score for correct answers.
11. Sets `score`, `submitted: true`, and `completedAt`.
12. Saves and returns the scored test.

## 9. Model Breakdown

### `Backend/src/models/user.model.js`

Model name: `users`

Fields:

- `username`: required string, unique.
- `email`: required string, unique.
- `password`: required string storing the bcrypt hash.

Used by auth controllers for registration, login, and get-me.

### `Backend/src/models/blacklist.model.js`

Model name: `blacklistTokens`

Fields:

- `token`: required string.
- timestamps.

Used by logout and auth middleware. Logout writes the token; auth middleware rejects blacklisted tokens.

### `Backend/src/models/session.model.js`

Model name: `Session`

Fields:

- `user`: ObjectId ref to `users`.
- `resume`: extracted resume text.
- `jobDescription`: target job text.
- `selfDescription`: candidate self description.
- `title`: AI-generated session title.
- `matchScore`: number from 0 to 100.
- `skillGaps`: array of `{ skill, severity }`, where severity is `low`, `medium`, or `high`.
- `refinedResumeHtml`: cached HTML for resume PDF generation.
- `history`: array of `{ type, label, detail, createdAt }`.
- timestamps.

Used as the parent resource for interview reports, aptitude tests, technical tests, and resume PDF generation.

### `Backend/src/models/interviewReport.model.js`

Model name: `InterviewReport`

Fields:

- `session`: ObjectId ref to `Session`.
- `user`: ObjectId ref to `users`.
- `technicalQuestions`: question/intention/answer entries.
- `behavioralQuestions`: question/intention/answer entries.
- `preparationPlan`: day/focus/tasks entries.
- timestamps.

Used by interview generation and retrieval.

### `Backend/src/models/aptitudeTest.model.js`

Model name: `AptitudeTest`

Fields:

- `session`: ObjectId ref to `Session`.
- `user`: ObjectId ref to `users`.
- `timeLimit`: number.
- `totalQuestions`: number.
- `questions`: array containing question, four options, correct answer index, user answer, and explanation.
- `score`: number or null.
- `submitted`: boolean.
- `completedAt`: Date or null.
- timestamps.

Correct answers and explanations are hidden before submission by controller logic.

### `Backend/src/models/technicalTest.model.js`

Model name: `TechnicalTest`

Fields:

- `session`: ObjectId ref to `Session`.
- `user`: ObjectId ref to `users`.
- `questions`: array containing question, correct answer, user answer, isCorrect, explanation, and difficulty.
- `score`: number or null.
- `submitted`: boolean.
- `completedAt`: Date or null.
- timestamps.

Correct answers and explanations are hidden before submission by controller logic.

## 10. Service Breakdown

`Backend/src/services/ai.service.js` contains the AI and PDF service logic.

### Model Setup

- `DEFAULT_AI_MODEL` is `gemini-2.5-flash`.
- `getModel()` requires `process.env.GOOGLE_GENAI_API_KEY`.
- It uses `process.env.GOOGLE_GENAI_MODEL || DEFAULT_AI_MODEL`.
- It returns `new ChatGoogleGenerativeAI(...)`.

### Structured Output

`invokeStructuredModel({ schema, name, prompt, purpose })`:

1. Calls `getModel().withStructuredOutput(schema, { name })`.
2. Invokes the prompt.
3. Logs service errors with purpose and stack.
4. Re-throws the error for the caller to wrap.

Zod schemas define expected AI outputs for:

- resume analysis
- interview report
- aptitude questions
- technical DSA questions
- resume HTML

### Normalization Helpers

- `normalizeLine(value)`: collapses whitespace into one line.
- `normalizeTextBlock(value)`: normalizes multi-line text.
- `normalizeMatchScore(value)`: clamps and rounds to 0-100.
- `normalizeSkillGaps(skillGaps)`: validates severity, removes duplicates, and keeps valid entries.
- `normalizeInterviewQuestions(questions)`: keeps complete question/intention/answer entries.
- `normalizePreparationPlan(plan)`: keeps valid day/focus/tasks items and caps to 7 days.
- `normalizeAptitudeQuestions(questions, questionCount)`: requires valid MCQs with exactly 4 options and enough questions.
- `normalizeTechnicalQuestions(questions, questionCount)`: requires short-answer technical questions and enough questions.
- `sanitizeHtmlDocument(htmlContent)`: returns a complete HTML document, wrapping partial HTML in a simple document shell.

### AI Functions

- `analyzeResume({ resume, selfDescription, jobDescription })`: asks AI for title, match score, and skill gaps; returns normalized data.
- `generateInterviewReport({ resume, selfDescription, jobDescription })`: asks AI for technical questions, behavioral questions, and a 7-day preparation plan.
- `generateAptitudeQuestions({ resume, jobDescription, count })`: asks AI for exactly the requested number of aptitude MCQs.
- `generateTechnicalDSAQuestions({ resume, jobDescription })`: asks AI for exactly 5 basic technical short-answer questions.
- `generateResumeHtml({ resume, selfDescription, jobDescription })`: asks AI for ATS-friendly resume HTML.

### PDF Functions

- `generatePDFFromHTML(htmlContent)`: launches Puppeteer with no-sandbox args, sets sanitized HTML content, renders A4 PDF with margins, and closes the browser in `finally`.
- `generateResumePDF({ resume, selfDescription, jobDescription, html })`: reuses existing HTML if provided, otherwise generates fresh resume HTML, then returns `{ html, pdfBuffer }`.

## 11. Middleware Breakdown

### `Backend/src/middlewares/auth.middleware.js`

Export:

- `authUser`

Purpose:

- Protects private routes.
- Reads JWT from the `token` cookie.
- Rejects missing, blacklisted, or invalid tokens.
- Assigns decoded token payload to `req.user`.

### `Backend/src/middlewares/file.middleware.js`

Export:

- `upload`

Purpose:

- Uses `multer.memoryStorage()`, so uploaded files are available as `req.file.buffer`.
- Limits file size to `3 * 1024 * 1024`.
- Accepts only files where `file.mimetype === "application/pdf"`.

Used by:

- `POST /api/session/` with `upload.single("resume")`.

## 12. Session History Utility

`Backend/src/utils/session-history.js` exports `prependHistoryEntry(session, entry)`.

It:

1. Builds a history entry with `type`, `label`, `detail || ""`, and `createdAt: new Date()`.
2. Prepends it to existing `session.history`.
3. Caps the history array to 20 entries.

Used by:

- `updateSessionController`
- `generateInterviewController`
- `generateResumePDFController`
- `generateAptitudeTestController`
- `generateTechnicalTestController`

## 13. Learning Notes

The backend is built around owned sessions. A user registers or logs in, receives a JWT in an HTTP-only cookie, and then protected routes use `authUser` to decode that cookie into `req.user`. Session creation uploads a PDF resume, extracts text, asks AI for a match analysis, and stores the result in MongoDB. From that session, the backend can generate interview reports, aptitude tests, technical tests, and resume PDFs.

The common request chain is:

`server.js` -> `app.js` middleware -> route file -> `authUser` and optional upload middleware -> controller -> Mongoose model or AI service -> database/AI/PDF work -> JSON or PDF response.

Where to look first:

- Auth behavior: `Backend/src/controllers/auth.controller.js`, `Backend/src/middlewares/auth.middleware.js`, `Backend/src/models/user.model.js`, `Backend/src/models/blacklist.model.js`
- Routes: `Backend/src/app.js` and `Backend/src/routes`
- Session analysis: `Backend/src/controllers/session.controller.js`, `Backend/src/models/session.model.js`, `Backend/src/services/ai.service.js`
- Interview generation: `Backend/src/controllers/interview.controller.js`, `Backend/src/models/interviewReport.model.js`
- Aptitude tests: `Backend/src/controllers/aptitude.controller.js`, `Backend/src/models/aptitudeTest.model.js`
- Technical tests: `Backend/src/controllers/technical.controller.js`, `Backend/src/models/technicalTest.model.js`
- Resume PDF generation: `Backend/src/controllers/interview.controller.js` and `Backend/src/services/ai.service.js`
- Upload behavior: `Backend/src/middlewares/file.middleware.js`
- History entries: `Backend/src/utils/session-history.js`
