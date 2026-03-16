# InterviewMaster-AI

Backend foundation for an AI interview preparation platform.

## Current Progress

Estimated completion: **~35% (backend auth foundation done, core product features pending)**

Completed so far:
- Express server bootstrap and app wiring
- MongoDB connection setup with Mongoose
- User model and blacklist token model
- Auth routes (`register`, `login`, `logout`, `get-me`)
- JWT cookie-based authentication middleware
- `.gitignore` added for Node, env files, logs, and build artifacts

Still pending:
- Interview question generation features
- AI integrations and prompt flows
- Interview session lifecycle and history
- Role/topic-based question sets
- Frontend application integration details
- Input validation hardening and centralized error handling
- Automated tests (unit/integration)
- CI/CD and deployment documentation

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Cookie handling (`cookie-parser`)

## Project Structure

```text
.
├── server.js
├── package.json
├── .gitignore
└── src
    ├── app.js
    ├── config
    │   └── database.js
    ├── controllers
    │   └── auth.controller.js
    ├── middlewares
    │   └── auth.middleware.js
    ├── models
    │   ├── user.model.js
    │   └── blacklist.model.js
    └── routes
        └── auth.routes.js
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a `.env` file in the root with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. Run the server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Server runs on: `http://localhost:3000`

## API Endpoints (Implemented)

Base path: `/api/auth`

- `POST /register`
- `POST /login`
- `GET /logout`
- `GET /get-me` (protected)

Example request payloads:

Register:

```json
{
	"username": "john",
	"email": "john@example.com",
	"password": "securePassword123"
}
```

Login:

```json
{
	"email": "john@example.com",
	"password": "securePassword123"
}
```

## Auth Flow

1. User registers/logs in.
2. Server creates JWT and stores it in a cookie named `token`.
3. Protected routes use `auth.middleware.js` to verify token.
4. Logout adds the token to blacklist and clears cookie.

## Known Gaps

- No formal validation library yet (like `zod`/`joi`/`express-validator`)
- No centralized error handler middleware yet
- No test suite configured
- Cookie security flags can be improved for production (`httpOnly`, `secure`, `sameSite`)

## Suggested Next Milestones

1. Add robust request validation and centralized error handling.
2. Add interview domain models and APIs (sessions, questions, answers).
3. Integrate AI provider for dynamic question generation.
4. Add tests for auth and protected routes.
5. Add deployment guide and environment-specific configs.
