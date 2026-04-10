# Product Requirements Document (PRD): InterviewMaster-AI

## 1. Project Summary
InterviewMaster-AI is a full-stack, AI-powered interview preparation platform designed as a final year college project. It allows users to create an account, upload their resumes, and leverage AI to analyze their profiles. The AI extracts key information, generates a refined version of their resume in HTML format, and provides interactive tools on a dashboard. Users can generate tailored interview approaches, aptitude tests, and technical tests based on their specific resume data.

## 2. Tech Stack
- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **AI Integration:** LangChain.js

## 3. Key Features
- **Authentication:** Email and password-based Login and Registration.
- **Resume Upload & Processing:** 
  - Upload a resume file.
  - Analyze the resume using AI.
  - Store extracted profile information and a *newly refined resume* (in HTML format) in the database.
- **Interactive Dashboard:** 
  - Dashboard populates using the resume data from the database.
  - **Button:** Generate Resume Interview Approach
  - **Button:** Generate Aptitude Test
  - **Button:** Generate Technical Test
  - **Button:** Download New Resume
  - **Button:** Save (to update the database with any new/edited information).

---

## 4. Epics & Tasks

### Epic 1: User Authentication & Security
**Objective:** Allow users to securely register, log in, and access their private dashboard.
- **Task 1.1:** Build the Registration component and backend API endpoint (hashing password).
- **Task 1.2:** Build the Login component and backend API endpoint (issuing JWT).
- **Task 1.3:** Setup Frontend Context/State to manage the user session.
- **Task 1.4:** Create protected routes (e.g., `<Protected />`) so only authenticated users can access the Dashboard.

### Epic 2: Resume Upload & AI Analysis
**Objective:** Handle file uploads and use LangChain.js to extract data and restructure the resume.
- **Task 2.1:** Build the frontend file upload UI.
- **Task 2.2:** Implement backend route and middleware to accept uploaded files.
- **Task 2.3:** Integrate LangChain.js in `ai.service.js` to parse the uploaded resume text.
- **Task 2.4:** Prompt the AI to generate a highly refined, professional version of the resume in HTML format.
- **Task 2.5:** Save the extracted JSON data (skills, experience, etc.) and the HTML resume into MongoDB (`user` or `session` model).

### Epic 3: Dashboard & AI Generators
**Objective:** Provide a centralized hub for users to interact with their AI-generated interview prep materials.
- **Task 3.1:** Fetch user data from the database and populate the Dashboard upon loading.
- **Task 3.2:** Implement the **"Generate Resume Interview Approach"** feature (Frontend button -> Backend LangChain prompt -> Display strategy).
- **Task 3.3:** Implement the **"Generate Aptitude Test"** feature (Frontend button -> Backend AI generation of quantitative/logical questions -> Render in `AptitudeTest.jsx`).
- **Task 3.4:** Implement the **"Generate Technical Test"** feature (Frontend button -> Backend AI generation of tech-stack specific questions -> Render in `TechnicalTest.jsx`).
- **Task 3.5:** Implement the **"Download New Resume"** feature (Trigger download of the HTML resume stored in DB, or convert to PDF for download).

### Epic 4: Data Management & Updating
**Objective:** Allow users to refine their data and save changes.
- **Task 4.1:** Make dashboard fields editable (so the user can tweak the AI's data extraction if needed).
- **Task 4.2:** Implement the **"Save"** button to send updated JSON profile information back to the MongoDB database.
- **Task 4.3:** Add toast notifications (`toast.context.jsx`) on success or error for all dashboard actions.
