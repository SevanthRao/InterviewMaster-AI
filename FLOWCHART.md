# Flowchart Generation Prompt

Copy and paste the prompt below into an AI assistant (like ChatGPT, Claude, or Gemini) to generate a comprehensive Mermaid.js flowchart for the **InterviewMaster-AI** project.

---

### Prompt

```text
Please generate a comprehensive Mermaid.js flowchart for my project, "InterviewMaster-AI". 

Here is the complete project structure and context to help you understand the architecture and data flow so you can map it out effectively:

**Project Architecture:**
- **Frontend:** React + Vite, using Context API for state management (Auth, Toast) and React Router for navigation. 
- **Backend:** Node.js + Express, using MongoDB (Mongoose models), LangChain with Google Gemini for AI services, and Puppeteer for PDF generation.

**Core Folder Structure:**
- `Backend/`
  - `src/models/`: user, session, aptitudeTest, technicalTest, interviewReport, blacklist
  - `src/controllers/` & `src/routes/`: auth, session, aptitude, technical, interview
  - `src/services/` : ai.service.js (Handles Gemini AI integration, resume analysis, AI question generation, and Puppeteer PDF rendering)
  - `src/middlewares/` : auth (JWT validation), file (Multer resume upload)
- `Frontend/`
  - `src/features/auth/`: Login and Register pages, AuthContext, JWT handling
  - `src/features/interview/`: Home, Dashboard, Interview, AptitudeTest, TechnicalTest pages

**Key User Flows to Include in the Flowchart:**
1. **Authentication:** User registers / logs in -> Backend validates -> JWT returned -> Auth Context updated in Frontend.
2. **Dashboard & Setup:** User navigates to Dashboard -> Uploads Resume and provides Job Description -> Backend `ai.service.js` parses and analyzes resume via Gemini AI.
3. **Assessment Process:** 
   - **Aptitude Test:** AI generates tailored MCQ questions -> User submits -> Backend evaluates.
   - **Technical Test:** AI generates conceptual/DSA questions -> User submits -> Backend evaluates.
4. **Results & Feedback:** 
   - Backend `ai.service.js` synthesizes test performance into a final Interview Report and automated Preparation Plan.
   - Puppeteer renders an ATS-friendly Resume PDF.
   - User views and downloads reports on the Frontend.

Based on this information, please generate a `mermaid` flowchart code block (using `graph TD` or `graph LR`) that visually connects these frontend components, backend routes, AI services, and database models. 

Please use `subgraph` blocks to visually separate:
1. **Frontend (React App)**
2. **Backend (Express API)**
3. **Database (MongoDB)**
4. **External Services (Google Gemini AI)**
```