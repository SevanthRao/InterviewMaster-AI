# `ai.service.js` Function Guide

This file explains each function in [ai.service.js](/home/sevanth/Desktop/collegeProject/Project/InterviewMaster-AI/Backend/src/services/ai.service.js) in brief.

## Main idea

`ai.service.js` is the backend AI utility file. It:

- creates the Google GenAI model client
- sends structured prompts to the model
- validates and cleans the AI response
- generates interview data, aptitude questions, technical questions, and resume PDFs

## Functions

### `getModel()`  
Location: `ai.service.js:10`

Checks whether `GOOGLE_GENAI_API_KEY` exists in environment variables. If the key is missing, it throws an error. If the key exists, it creates and returns a `ChatGoogleGenerativeAI` instance using the configured model name, or `gemini-2.5-flash` by default.

### `normalizeLine(value)`  
Location: `ai.service.js:21`

Used to clean short single-line strings. If the input is not a string, it returns an empty string. Otherwise, it removes extra spaces and trims the text.

### `normalizeTextBlock(value)`  
Location: `ai.service.js:29`

Used to clean longer text blocks. It normalizes line breaks, removes trailing spaces before new lines, collapses too many blank lines, and trims the result.

### `normalizeMatchScore(value)`  
Location: `ai.service.js:41`

Converts the AI score into a safe number. If the value is invalid, it returns `0`. Otherwise, it rounds the number and clamps it between `0` and `100`.

### `normalizeSkillGaps(skillGaps)`  
Location: `ai.service.js:51`

Cleans the skill gap list from AI output. It keeps only valid entries that have:

- a non-empty skill name
- a severity of `low`, `medium`, or `high`

It also removes duplicate skills by comparing them case-insensitively.

### `normalizeInterviewQuestions(questions)`  
Location: `ai.service.js:78`

Cleans technical or behavioral interview questions. For each item, it keeps only entries that contain:

- a valid question
- a valid intention
- a valid answer

Invalid or incomplete items are skipped.

### `normalizePreparationPlan(plan)`  
Location: `ai.service.js:97`

Cleans the 7-day preparation plan returned by AI. It keeps only items that have a focus and at least one valid task. If the day number is missing or invalid, it uses the item position as the day number. It then limits the final plan to `PREPARATION_PLAN_DAYS`, which is `7`.

### `normalizeAptitudeQuestions(questions, questionCount)`  
Location: `ai.service.js:120`

Validates and cleans aptitude MCQ questions. Each question must have:

- question text
- exactly 4 options
- a valid `correctAnswer` index from `0` to `3`
- an explanation

If the AI returns fewer valid questions than requested, the function throws an error. Otherwise, it returns exactly the requested number.

### `normalizeTechnicalQuestions(questions, questionCount)`  
Location: `ai.service.js:157`

Validates and cleans technical short-answer questions. Each item must have:

- question text
- correct answer
- explanation

It also normalizes `difficulty`, defaulting to `"basic"` if empty. If too few valid questions remain after cleanup, it throws an error.

### `sanitizeHtmlDocument(htmlContent)`  
Location: `ai.service.js:188`

Prepares HTML before PDF generation. If the input is empty, it returns an empty string. If the input already contains a full HTML document, it returns it as-is. Otherwise, it wraps the HTML fragment inside a basic full document with `<html>`, `<head>`, and `<body>` tags plus simple styling.

### `invokeStructuredModel({ schema, name, prompt, purpose })`  
Location: `ai.service.js:220`

This is the common helper that talks to the AI model. It:

- gets the model from `getModel()`
- applies a Zod schema using `withStructuredOutput(...)`
- sends the prompt to the model
- returns the parsed structured response

If anything fails, it logs the error with the provided `purpose` label and rethrows it.

### `analyzeResume({ resume, selfDescription, jobDescription })`  
Location: `ai.service.js:279`

Creates a prompt asking the AI to compare the candidate resume against the target job. It expects:

- a title
- a match score
- a list of skill gaps

After the AI responds, it normalizes the title, score, and skill gaps before returning them. If the result is incomplete or the AI call fails, it throws a user-friendly error.

### `generateInterviewReport({ resume, selfDescription, jobDescription })`  
Location: `ai.service.js:317`

Creates a prompt asking the AI for:

- technical interview questions
- behavioral interview questions
- a 7-day preparation plan

It validates and normalizes all three sections. If any section ends up empty after cleanup, it treats the response as incomplete and throws an error.

### `generateAptitudeQuestions({ resume, jobDescription, count })`  
Location: `ai.service.js:361`

Converts `count` into a number and checks that it is valid. Then it asks the AI to generate exactly that many aptitude MCQs relevant to the resume and job description. The response is validated through `normalizeAptitudeQuestions(...)`. If the AI output is invalid or too short, it throws an error.

### `generateTechnicalDSAQuestions({ resume, jobDescription })`  
Location: `ai.service.js:396`

Asks the AI to generate exactly `5` basic-level technical screening questions focused on programming and DSA fundamentals. The response is validated through `normalizeTechnicalQuestions(...)`. If the response is invalid or incomplete, it throws an error.

### `generatePDFFromHTML(htmlContent)`  
Location: `ai.service.js:426`

Converts HTML into a PDF using Puppeteer. It:

- sanitizes the HTML
- opens a headless browser
- loads the HTML into a page
- renders it as an A4 PDF with margins and background printing enabled

If PDF creation fails, it logs the error and throws a PDF-specific error. The browser is always closed in `finally`, even if something breaks.

### `generateResumeHtml({ resume, selfDescription, jobDescription })`  
Location: `ai.service.js:467`

Asks the AI to generate a refined, ATS-friendly resume in HTML format. It expects one field: `html`. After the response is received, it checks that HTML exists and then sanitizes it into a full HTML document if needed.

This function is internal right now. It is used by `generateResumePDF(...)` when stored HTML is not already available.

### `generateResumePDF({ resume, selfDescription, jobDescription, html })`  
Location: `ai.service.js:509`

This is the final resume output function. It decides between two paths:

- if `html` already exists, it sanitizes and reuses it
- if `html` is missing, it first calls `generateResumeHtml(...)`

After that, it calls `generatePDFFromHTML(...)` and returns both:

- `html`
- `pdfBuffer`

If PDF generation itself fails, it preserves that exact error. Otherwise, it throws a general resume PDF error.

## Exported functions

These are the functions currently exported and used by controllers:

- `analyzeResume`
- `generateInterviewReport`
- `generateAptitudeQuestions`
- `generateTechnicalDSAQuestions`
- `generateResumePDF`
