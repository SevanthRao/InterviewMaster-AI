# Interlix

Interlix is a full-stack interview preparation platform that analyzes a candidate's resume against a target job description, then generates tailored interview prep materials with AI.

The project is split into:

- `Frontend/`: React + Vite client
- `Backend/`: Express + MongoDB API with AI-powered analysis and test generation

## What The App Does

Users can:

- Register, log in, and stay authenticated with cookie-based JWT auth
- Upload a PDF resume
- Add a self-description and target job description
- Generate a session with AI-based resume analysis
- View a match score and identified skill gaps
- Generate interview prep content for a session
- Generate aptitude tests
- Generate technical/DSA-style tests
- Download an AI-refined PDF resume
- Revisit previous sessions from dashboard/history views

## Tech Stack

### Frontend

- React 19
- React Router 7
- Vite 8
- Axios
- Tailwind CSS 4

### Backend

- Node.js
- Express 5
- MongoDB + Mongoose
- JWT authentication
- Multer for PDF upload handling
- `pdf-parse` for extracting resume text
- LangChain + Google GenAI for structured AI output
- Puppeteer for PDF resume generation

## Project Structure

```text
Interlix/
├── Backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
├── Frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── features/
│       ├── hooks/
│       ├── layouts/
│       └── lib/
└── README.md
```

## Main User Flow

1. User registers or logs in.
2. User uploads a PDF resume and provides:
   - self description
   - target job description
3. Backend extracts text from the PDF.
4. AI analyzes the profile and creates a session with:
   - a title
   - match score
   - skill gaps
5. User can generate:
   - interview report
   - aptitude test
   - technical test
   - refined resume PDF

## Frontend Routes

Public routes:

- `/`
- `/login`
- `/register`

Protected routes:

- `/app`
- `/app/session/:sessionId`
- `/app/session/:sessionId/interview`
- `/app/session/:sessionId/aptitude`
- `/app/session/:sessionId/technical`

## Backend API

Base groups:

- `/api/auth`
- `/api/session`
- `/api/interview`
- `/api/aptitude`
- `/api/technical`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/logout`
- `GET /api/auth/get-me`

### Sessions

- `POST /api/session/`
- `GET /api/session/`
- `GET /api/session/:sessionId`
- `PATCH /api/session/:sessionId`

### Interview

- `POST /api/interview/:sessionId/generate`
- `GET /api/interview/:sessionId`
- `POST /api/interview/:sessionId/resume/pdf`

### Aptitude

- `POST /api/aptitude/:sessionId/generate`
- `GET /api/aptitude/:testId`
- `POST /api/aptitude/:testId/submit`

### Technical

- `POST /api/technical/:sessionId/generate`
- `GET /api/technical/:testId`
- `POST /api/technical/:testId/submit`

## Environment Variables

### Backend `.env`

Create `Backend/.env`:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
GOOGLE_GENAI_MODEL=gemini-2.5-flash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
NODE_ENV=development
```

### Frontend `.env`

Create `Frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Important:

- The frontend currently falls back to `http://localhost:5000` if `VITE_API_BASE_URL` is not set.
- The backend currently falls back to port `3000`.
- To make local development work cleanly, set `VITE_API_BASE_URL=http://localhost:3000`.

## Local Setup

### 1. Install frontend dependencies

```bash
cd Frontend
npm install
```

### 2. Install backend dependencies

```bash
cd Backend
npm install
```

### 3. Start the backend

```bash
cd Backend
npm run dev
```

### 4. Start the frontend

```bash
cd Frontend
npm run dev
```

### 5. Open the app

Frontend default:

- `http://localhost:5173`

Backend default:

- `http://localhost:3000`

## Available Scripts

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```bash
npm run dev
npm start
npm test
```

## Request Requirements And Validation Notes

- Resume upload accepts PDF files only
- Maximum upload size is 3 MB
- Session creation requires:
  - resume PDF
  - `selfDescription`
  - `jobDescription`
- Aptitude generation requires:
  - `timeLimit` between 5 and 60 minutes
  - `questionCount` between 5 and 30
- Technical test answers are submitted as strings
- Aptitude answers are submitted as option indexes

## Authentication

- Authentication uses JWT stored in cookies
- Protected routes require a valid authenticated user
- Logout blacklists the token and clears the cookie
- CORS is configured to allow credentialed requests from configured frontend origins

## AI Features

The backend AI service is responsible for:

- resume analysis
- match score generation
- skill gap extraction
- interview report generation
- aptitude question generation
- technical question generation
- refined resume HTML/PDF generation

The current default model is:

- `gemini-2.5-flash`

## Current Notes

- There is no root-level package script orchestration yet; frontend and backend are started separately.
- Local setup depends on a working MongoDB connection and Google GenAI API key.
- The root README is the best place to start; there are also older package-specific READMEs inside `Frontend/` and `Backend/`.

## Suggested Future Improvements

- Add a root `package.json` with combined dev scripts
- Add `.env.example` files for both apps
- Add automated API and UI tests
- Add deployment instructions
- Add screenshots or architecture diagrams
- Standardize frontend/backend default ports to remove setup confusion
