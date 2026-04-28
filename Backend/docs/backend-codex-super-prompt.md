# Backend Analysis Super Prompt for Codex

Use this prompt when you want Codex to analyze only the Backend of this project and update backend markdown documentation from the current source code.

## Prompt

```text
You are Codex working in the InterviewMaster-AI repository.

Analyze only the Backend folder. Do not analyze the Frontend unless a backend file directly depends on a frontend contract, request body, response shape, cookie behavior, CORS origin, or route expectation visible from backend code.

Read the full Backend codebase and explain it like a learning document for a student. Your job is to describe how the backend is structured, how the API routes are created and connected, what each controller function does, how each model works, how the AI service works, and how the request/response flow behaves.

You must create or update actual markdown files in Backend/docs. Do not only print the documentation in chat.

Create or update these files:
1. Backend/docs/backend-codex-super-prompt.md
2. Backend/docs/backend-architecture-and-flow.md
3. Backend/docs/backend-file-purpose-index.md

Rules:
- Focus only on the Backend folder.
- Ignore Backend/node_modules if it exists.
- Use only facts visible in the current codebase.
- Do not invent files, functions, endpoints, middleware, models, schemas, request fields, response fields, services, environment variables, or behavior.
- Mention exact file names for every important behavior.
- Mention exact route paths from the route files and app mounting paths.
- Explain which route calls which controller function.
- Explain which middleware runs before each protected controller.
- Explain how each controller uses models, middleware-provided data, utilities, and services.
- Explain what each Mongoose model stores and why it exists.
- Explain how auth, cookies, JWT, and token blacklist work.
- Explain how session, interview, aptitude, technical, resume PDF, and history data flow through the backend.
- Explain the AI service functions, schemas, normalization helpers, model selection, structured output, and PDF generation flow.
- Explain request validation, ownership checks, hidden-answer behavior, artifact invalidation, and error responses where visible.
- If a feature is driven by multiple files, explain the chain from route to controller to model/service.

The analysis must cover:

Project structure:
- Backend/server.js
- Backend/src/app.js
- Backend/src/config/database.js
- Backend/src/routes
- Backend/src/controllers
- Backend/src/models
- Backend/src/middlewares
- Backend/src/services
- Backend/src/utils
- Backend/package.json

Server startup flow:
- dotenv loading.
- app import.
- MongoDB connection through connectDB.
- app.listen only after database connection succeeds.
- failure path when DB connection fails.

Route map:
- List every API endpoint.
- Include method, full path, route file, middleware, controller function, and purpose.
- Include the 404 fallback from Backend/src/app.js.

Controller breakdown:
- Backend/src/controllers/auth.controller.js
- Backend/src/controllers/session.controller.js
- Backend/src/controllers/interview.controller.js
- Backend/src/controllers/aptitude.controller.js
- Backend/src/controllers/technical.controller.js
- Explain helper functions inside controllers too, such as normalization, ObjectId validation, owned-session lookup, and artifact invalidation.

Model breakdown:
- Backend/src/models/user.model.js
- Backend/src/models/blacklist.model.js
- Backend/src/models/session.model.js
- Backend/src/models/interviewReport.model.js
- Backend/src/models/aptitudeTest.model.js
- Backend/src/models/technicalTest.model.js

Service breakdown:
- Backend/src/services/ai.service.js
- Explain getModel, structured output invocation, zod schemas, normalization helpers, analyzeResume, generateInterviewReport, generateAptitudeQuestions, generateTechnicalDSAQuestions, generateResumeHtml, sanitizeHtmlDocument, generatePDFFromHTML, and generateResumePDF.

Middleware breakdown:
- Backend/src/middlewares/auth.middleware.js
- Backend/src/middlewares/file.middleware.js
- Explain auth cookie reading, blacklist check, jwt.verify, req.user assignment, multer memory storage, PDF file filtering, and 3 MB upload limit.

Utility breakdown:
- Backend/src/utils/session-history.js
- Explain prependHistoryEntry and the 20-item history cap.

File purpose index:
- List every important backend file.
- For each file, explain its purpose, exports, important functions, models, routes, or configuration.

Learning summary:
- End with a simple explanation of how a request moves through the backend:
  server boot -> app middleware -> route -> auth/upload middleware -> controller -> model/service -> database/AI/PDF -> response.
- Include a short guide on where a developer should look first when changing auth, routes, session analysis, interview generation, aptitude tests, technical tests, resume PDF generation, models, or middleware.

After writing the files, summarize in chat which files were created or updated and what each contains.
```

## Quick Checklist For Codex

- Start with `rg --files Backend -g '!node_modules/**'`.
- Read `Backend/server.js`, `Backend/src/app.js`, and `Backend/src/config/database.js` before explaining boot flow.
- Read all files in `Backend/src/routes` before writing the route map.
- Read all files in `Backend/src/controllers` before writing controller behavior.
- Read all files in `Backend/src/models` before writing schema behavior.
- Read `Backend/src/services/ai.service.js` before writing AI and PDF behavior.
- Read `Backend/src/middlewares/auth.middleware.js` and `Backend/src/middlewares/file.middleware.js` before writing middleware behavior.
- Read `Backend/src/utils/session-history.js` before writing history behavior.
- Write the documentation files into `Backend/docs`.
