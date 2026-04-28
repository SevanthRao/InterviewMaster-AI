# Frontend Codex Super Prompt

Use this prompt in Codex when you want a deep, source-based frontend analysis of this project.

```text
You are Codex working in the InterviewMaster-AI repository.

Analyze only the Frontend folder. Do not analyze Backend unless a frontend file directly depends on it through an API call, route expectation, environment variable, or request/response shape visible from frontend code.

Your task is to deeply read the current frontend codebase and create or update actual markdown files in Frontend/docs. Do not only print the documentation in chat.

Create or update these files:
1. Frontend/docs/frontend-codex-super-prompt.md
2. Frontend/docs/frontend-architecture-and-flow.md
3. Frontend/docs/frontend-file-purpose-index.md

Rules:
- Use only facts visible in the current codebase.
- Do not invent files, functions, routes, components, APIs, props, state variables, or behavior.
- Mention exact file names.
- Mention exact route paths from the router.
- Mention exact exported service functions and their HTTP method/path.
- Explain what every important page does from the user's perspective.
- Explain what every important function does, especially handlers, validation functions, API wrappers, context actions, and helper functions.
- Explain where each API call happens and which page/context calls it.
- Explain how state is owned and passed through the app.
- Explain how the design system is built from CSS variables, utility classes, Tailwind classes, cards, buttons, inputs, spinners, toasts, layouts, and inline styles.
- Keep the documentation learning-friendly, clear, and connected to the actual source.
- Do not include generated build files from Frontend/dist or dependencies from Frontend/node_modules as part of the source architecture.

The analysis must cover:

Project structure:
- Entry files such as Frontend/index.html, Frontend/src/main.jsx, Frontend/src/App.jsx, and Frontend/src/app.routes.jsx.
- Frontend configuration such as package.json, vite.config.js, postcss.config.js, eslint.config.js, and public assets.
- Source organization under Frontend/src/components, Frontend/src/contexts, Frontend/src/hooks, Frontend/src/layouts, Frontend/src/features, and Frontend/src/lib.

App flow:
- Browser startup through index.html, main.jsx, App.jsx, providers, router, and route elements.
- Public routes and protected routes.
- Layout behavior for authenticated pages.
- Full-screen test routes that are protected but not wrapped in AppLayout.

Routes:
- List every route from Frontend/src/app.routes.jsx.
- Explain which component each route renders.
- Explain redirects and protection behavior.

Page-by-page breakdown:
- Frontend/src/features/landing/pages/Landing.jsx
- Frontend/src/features/auth/Pages/Login.jsx
- Frontend/src/features/auth/Pages/Register.jsx
- Frontend/src/features/sessions/pages/SessionsHome.jsx
- Frontend/src/features/sessions/pages/SessionDashboard.jsx
- Frontend/src/features/interview/pages/Interview.jsx
- Frontend/src/features/aptitude/pages/AptitudeTest.jsx
- Frontend/src/features/technical/pages/TechnicalTest.jsx

Function-by-function breakdown:
- App, AppRoutes, Protected, AuthProvider, ToastProvider, useAuth, useToast.
- Page-level validate, submit, generate, save, file handling, answer handling, timer, and navigation functions.
- Service-layer functions in auth.api.js, session.api.js, interview.api.js, aptitude.api.js, and technical.api.js.
- Shared component functions such as Spinner, PageLoader, ToastContainer, FeatureCard, SessionCard, SkillGapBadge, MatchScoreGauge, and HistoryTimeline.

API map:
- Base client in Frontend/src/lib/api.client.js.
- Auth endpoints.
- Session endpoints.
- Interview endpoints.
- Resume PDF endpoint.
- Aptitude endpoints.
- Technical endpoints.
- For every endpoint, include method, path, service function, and caller file if visible.

Design system:
- Explain Frontend/src/index.css tokens and utility classes.
- Explain dark theme, glass-card pattern, gradient text/button pattern, inputs, textareas, loaders, animations, toasts, sidebar, and full-screen test layouts.
- Explain how components combine Tailwind classes with CSS variables and inline styles.

File purpose index:
- List every important frontend file.
- For each file, explain its purpose and important functions/components.
- Include app entry files, contexts, hooks, layouts, shared components, feature pages, and service files.
- Note visible source-level observations such as unused imports only if they are directly visible from frontend code.

Learning summary:
- End with a concise explanation of how a user moves through the app:
  landing -> auth -> session creation -> dashboard -> interview/aptitude/technical/resume tools -> results/history.
- Include a short guide on where a developer should look first when changing routes, auth, API calls, session creation, tests, design tokens, or shared UI.

After writing the files, summarize in chat which files were created or updated and what each contains.
```

## Quick Checklist For Codex

- Start with `rg --files Frontend` and ignore `Frontend/node_modules` and `Frontend/dist`.
- Read `Frontend/src/app.routes.jsx` before explaining navigation.
- Read `Frontend/src/lib/api.client.js` and all `*.api.js` service files before writing the API map.
- Read page files before writing user flows.
- Read `Frontend/src/index.css` before writing design system notes.
- Write the documentation files into `Frontend/docs`.
