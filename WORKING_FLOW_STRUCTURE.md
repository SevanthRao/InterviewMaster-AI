# Working Flow Structure

## Core Idea
This project works around one central object: the `Session`.

The real system rule is:

1. Create a session from resume + self description + job description.
2. Save that session in MongoDB.
3. Use that saved session for every feature.
4. If source session data changes, re-analyze and clear stale generated outputs.

---

## Runtime Flow

### Step 1: User Authentication
- User logs in or registers.
- Auth cookie is stored.
- Frontend restores the user through the auth provider.

### Step 2: Analyze Resume
- User uploads PDF.
- Backend extracts resume text.
- AI creates:
  - title
  - match score
  - skill gaps
- Backend saves one session.

### Step 3: Dashboard Opens
- Dashboard fetches the session.
- Dashboard shows:
  - recent history
  - editable source fields
  - derived summary
  - feature actions

### Step 4: Session Update
- User edits:
  - self description
  - job description
  - resume text
- Backend re-analyzes from those 3 fields.
- Backend updates derived values.
- Backend clears stale report/test/resume cache.
- Backend saves history.

### Step 5: Feature Generation
From the dashboard, each button works from the current saved session:

- Interview Approach
- Aptitude Test
- Technical Test
- AI Resume

Each one adds history to that same session.

---

## Persistence Structure

### Main Persistent Entities
- `User`
- `Session`
- `InterviewReport`
- `AptitudeTest`
- `TechnicalTest`
- `BlacklistToken`

### Most Important Entity
`Session`

Because it stores:
- resume text
- self description
- job description
- title
- match score
- skill gaps
- refined resume html cache
- session history

---

## History Structure

History belongs to the session, not to the page.

That means when the user clicks a saved session:
- the app can show what happened for that session
- the history is permanent until database data changes
- the latest activity can also be previewed from Home

Current history entry types:
- `session_created`
- `session_updated`
- `interview_report_generated`
- `interview_report_reused`
- `aptitude_generated`
- `technical_generated`
- `resume_generated`

---

## Folder-To-Flow Mapping

### Frontend
- pages = what the user sees
- services = API requests
- context/hooks = shared frontend state
- shared = reusable common pieces

### Backend
- routes = endpoint mapping
- controllers = request logic
- services = AI logic
- models = database structure
- middleware = request guards
- utils = helper logic

---

## Practical Understanding

If you want to explain this project in one sentence:

InterviewMaster-AI is a session-driven interview preparation platform where one analyzed resume session becomes the source for all later AI-generated interview and test features.
