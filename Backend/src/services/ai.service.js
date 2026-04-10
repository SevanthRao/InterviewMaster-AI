const { ChatGoogleGenerativeAI } = require("@langchain/google-genai")
const { z } = require("zod")
const puppeteer = require("puppeteer")

const DEFAULT_AI_MODEL = "gemini-2.5-flash"
const PREPARATION_PLAN_DAYS = 7
const TECHNICAL_QUESTION_COUNT = 5
const SKILL_GAP_SEVERITIES = new Set(["low", "medium", "high"])

function ensureAIConfigured() {
    if (!process.env.GOOGLE_GENAI_API_KEY) {
        throw new Error("Google GenAI API key is not configured")
    }
}

function getModel() {
    ensureAIConfigured()

    return new ChatGoogleGenerativeAI({
        model: process.env.GOOGLE_GENAI_MODEL || DEFAULT_AI_MODEL,
        apiKey: process.env.GOOGLE_GENAI_API_KEY
    })
}

function normalizeLine(value) {
    if (typeof value !== "string") {
        return ""
    }

    return value.replace(/\s+/g, " ").trim()
}

function normalizeTextBlock(value) {
    if (typeof value !== "string") {
        return ""
    }

    return value
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
}

function normalizeMatchScore(value) {
    const parsedValue = Number(value)

    if (!Number.isFinite(parsedValue)) {
        return 0
    }

    return Math.min(100, Math.max(0, Math.round(parsedValue)))
}

function normalizeSkillGaps(skillGaps) {
    if (!Array.isArray(skillGaps)) {
        return []
    }

    const seenSkills = new Set()

    return skillGaps.reduce((result, skillGap) => {
        const skill = normalizeLine(skillGap?.skill)
        const severity = normalizeLine(skillGap?.severity).toLowerCase()

        if (!skill || !SKILL_GAP_SEVERITIES.has(severity)) {
            return result
        }

        const uniqueKey = skill.toLowerCase()

        if (seenSkills.has(uniqueKey)) {
            return result
        }

        seenSkills.add(uniqueKey)
        result.push({ skill, severity })
        return result
    }, [])
}

function normalizeInterviewQuestions(questions) {
    if (!Array.isArray(questions)) {
        return []
    }

    return questions.reduce((result, item) => {
        const question = normalizeLine(item?.question)
        const intention = normalizeLine(item?.intention)
        const answer = normalizeTextBlock(item?.answer)

        if (!question || !intention || !answer) {
            return result
        }

        result.push({ question, intention, answer })
        return result
    }, [])
}

function normalizePreparationPlan(plan) {
    if (!Array.isArray(plan)) {
        return []
    }

    return plan.reduce((result, item, index) => {
        const focus = normalizeLine(item?.focus)
        const tasks = Array.isArray(item?.tasks)
            ? item.tasks.map(normalizeLine).filter(Boolean)
            : []

        if (!focus || tasks.length === 0) {
            return result
        }

        const parsedDay = Number(item?.day)
        const day = Number.isInteger(parsedDay) && parsedDay > 0 ? parsedDay : index + 1

        result.push({ day, focus, tasks })
        return result
    }, []).slice(0, PREPARATION_PLAN_DAYS)
}

function normalizeAptitudeQuestions(questions, questionCount) {
    if (!Array.isArray(questions)) {
        throw new Error("AI returned invalid aptitude questions")
    }

    const normalizedQuestions = questions.reduce((result, item) => {
        const question = normalizeTextBlock(item?.question)
        const options = Array.isArray(item?.options)
            ? item.options.map(normalizeLine).filter(Boolean).slice(0, 4)
            : []
        const explanation = normalizeTextBlock(item?.explanation)
        const correctAnswer = Number(item?.correctAnswer)

        if (!question || options.length !== 4 || !explanation) {
            return result
        }

        if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer > 3) {
            return result
        }

        result.push({
            question,
            options,
            correctAnswer,
            explanation
        })
        return result
    }, [])

    if (normalizedQuestions.length < questionCount) {
        throw new Error("AI returned fewer aptitude questions than requested")
    }

    return normalizedQuestions.slice(0, questionCount)
}

function normalizeTechnicalQuestions(questions, questionCount) {
    if (!Array.isArray(questions)) {
        throw new Error("AI returned invalid technical questions")
    }

    const normalizedQuestions = questions.reduce((result, item) => {
        const question = normalizeTextBlock(item?.question)
        const correctAnswer = normalizeLine(item?.correctAnswer)
        const explanation = normalizeTextBlock(item?.explanation)
        const difficulty = normalizeLine(item?.difficulty).toLowerCase() || "basic"

        if (!question || !correctAnswer || !explanation) {
            return result
        }

        result.push({
            question,
            correctAnswer,
            explanation,
            difficulty
        })
        return result
    }, [])

    if (normalizedQuestions.length < questionCount) {
        throw new Error("AI returned fewer technical questions than requested")
    }

    return normalizedQuestions.slice(0, questionCount)
}

function sanitizeHtmlDocument(htmlContent) {
    const html = typeof htmlContent === "string" ? htmlContent.trim() : ""

    if (!html) {
        return ""
    }

    if (/<html[\s>]/i.test(html)) {
        return html
    }

    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Refined Resume</title>
    <style>
      body {
        margin: 32px;
        font-family: Arial, sans-serif;
        line-height: 1.5;
        color: #111827;
      }
    </style>
  </head>
  <body>
    ${html}
  </body>
</html>`
}

async function invokeStructuredModel({ schema, name, prompt, purpose }) {
    try {
        const structuredModel = getModel().withStructuredOutput(schema, { name })
        return await structuredModel.invoke(prompt)
    } catch (err) {
        console.error(`${purpose} error:`, err.message)
        if (err.stack) {
            console.error("Stack:", err.stack)
        }

        throw err
    }
}

const resumeAnalysisSchema = z.object({
    title: z.string().describe("A short title summarizing the job role and candidate fit, for example 'Frontend Developer - Strong Match'"),
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate matches the job description"),
    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })).describe("List of skill gaps between the candidate's profile and the target job")
})

const interviewReportSchema = z.object({
    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })).describe("Technical interview questions with their intention and an example answer"),
    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })).describe("Behavioral interview questions with their intention and an example answer"),
    preparationPlan: z.array(z.object({
        day: z.number(),
        focus: z.string(),
        tasks: z.array(z.string())
    })).describe("A day-wise preparation plan for the candidate")
})

const aptitudeQuestionsSchema = z.object({
    questions: z.array(z.object({
        question: z.string().describe("The aptitude question text"),
        options: z.array(z.string()).describe("Exactly 4 answer options"),
        correctAnswer: z.number().describe("Index of the correct answer from 0 to 3"),
        explanation: z.string().describe("A brief explanation of the correct answer")
    })).describe("Array of aptitude MCQ questions")
})

const technicalDSASchema = z.object({
    questions: z.array(z.object({
        question: z.string().describe("A DSA or programming concept question answerable in a short text response"),
        correctAnswer: z.string().describe("The correct short answer"),
        explanation: z.string().describe("A concise explanation of the answer"),
        difficulty: z.string().describe("Difficulty label, preferably 'basic'")
    })).describe("Array of basic-level DSA and programming questions")
})

async function analyzeResume({ resume, selfDescription, jobDescription }) {
    const prompt = `Analyze this candidate's resume against the target job.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Return a short title, a numeric match score from 0 to 100, and a concise list of skill gaps.`

    try {
        const parsed = await invokeStructuredModel({
            schema: resumeAnalysisSchema,
            name: "resumeAnalysis",
            prompt,
            purpose: "Resume analysis"
        })

        const title = normalizeLine(parsed?.title)

        if (!title) {
            throw new Error("AI returned incomplete resume analysis")
        }

        return {
            title,
            matchScore: normalizeMatchScore(parsed?.matchScore),
            skillGaps: normalizeSkillGaps(parsed?.skillGaps)
        }
    } catch (err) {
        throw new Error("Failed to analyze resume. Please try again.")
    }
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Create an interview preparation report for this candidate.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Generate 8 to 10 technical questions, 5 to 6 behavioral questions, and a ${PREPARATION_PLAN_DAYS}-day preparation plan.`

    try {
        const parsed = await invokeStructuredModel({
            schema: interviewReportSchema,
            name: "interviewReport",
            prompt,
            purpose: "Interview report generation"
        })

        const technicalQuestions = normalizeInterviewQuestions(parsed?.technicalQuestions)
        const behavioralQuestions = normalizeInterviewQuestions(parsed?.behavioralQuestions)
        const preparationPlan = normalizePreparationPlan(parsed?.preparationPlan)

        if (
            technicalQuestions.length === 0 ||
            behavioralQuestions.length === 0 ||
            preparationPlan.length === 0
        ) {
            throw new Error("AI returned incomplete interview report")
        }

        return {
            technicalQuestions,
            behavioralQuestions,
            preparationPlan
        }
    } catch (err) {
        throw new Error("Failed to generate interview report from AI. Please try again.")
    }
}

async function generateAptitudeQuestions({ resume, jobDescription, count }) {
    const questionCount = Number(count)

    if (!Number.isInteger(questionCount) || questionCount < 1) {
        throw new Error("Invalid aptitude question count")
    }

    const prompt = `Generate exactly ${questionCount} aptitude MCQ questions for a candidate applying to this job.

Job Description:
${jobDescription}

Resume Context:
${resume}

Requirements:
- Cover logical reasoning, quantitative aptitude, verbal ability, and data interpretation.
- Provide exactly 4 options for every question.
- Mark the correct option with a zero-based answer index.
- Keep the questions relevant to the role and moderate in difficulty.`

    try {
        const parsed = await invokeStructuredModel({
            schema: aptitudeQuestionsSchema,
            name: "aptitudeQuestions",
            prompt,
            purpose: "Aptitude test generation"
        })

        return normalizeAptitudeQuestions(parsed?.questions, questionCount)
    } catch (err) {
        throw new Error("Failed to generate aptitude questions. Please try again.")
    }
}

async function generateTechnicalDSAQuestions({ resume, jobDescription }) {
    const prompt = `Generate exactly ${TECHNICAL_QUESTION_COUNT} basic-level technical screening questions for this candidate.

Job Description:
${jobDescription}

Resume and Skills:
${resume}

Requirements:
- Use short-answer or fill-in-the-blank style questions only.
- Focus on core programming and DSA fundamentals.
- Keep every answer short, ideally between 1 and 5 words.
- Include a clear explanation for each answer.
- Mark every question as basic difficulty unless there is a strong reason not to.`

    try {
        const parsed = await invokeStructuredModel({
            schema: technicalDSASchema,
            name: "technicalDSA",
            prompt,
            purpose: "Technical test generation"
        })

        return normalizeTechnicalQuestions(parsed?.questions, TECHNICAL_QUESTION_COUNT)
    } catch (err) {
        throw new Error("Failed to generate technical questions. Please try again.")
    }
}

async function generatePDFFromHTML(htmlContent) {
    let browser = null

    try {
        const sanitizedHtml = sanitizeHtmlDocument(htmlContent)

        if (!sanitizedHtml) {
            throw new Error("HTML content is empty")
        }

        browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
        })

        const page = await browser.newPage()
        await page.setContent(sanitizedHtml, { waitUntil: "networkidle0", timeout: 30000 })

        return await page.pdf({
            format: "A4",
            margin: {
                top: "20mm",
                right: "15mm",
                bottom: "20mm",
                left: "15mm"
            },
            printBackground: true
        })
    } catch (err) {
        console.error("PDF generation error:", err.message)
        if (err.stack) {
            console.error("Stack:", err.stack)
        }

        throw new Error("Failed to generate PDF from HTML content")
    } finally {
        if (browser) {
            await browser.close().catch(() => {})
        }
    }
}

async function generateResumeHtml({ resume, selfDescription, jobDescription }) {
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the refined resume")
    })

    const prompt = `Generate a refined, ATS-friendly resume in HTML for this candidate.

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Requirements:
- Tailor the resume to the target job description.
- Keep the layout professional and readable.
- Make the output realistic and human-sounding.
- Keep the resume concise enough to fit within 1 to 2 pages when rendered to PDF.`

    try {
        const response = await invokeStructuredModel({
            schema: resumePdfSchema,
            name: "resumeHtml",
            prompt,
            purpose: "Resume PDF generation"
        })

        const html = typeof response?.html === "string" ? response.html.trim() : ""

        if (!html) {
            throw new Error("AI returned empty resume HTML")
        }

        return sanitizeHtmlDocument(html)
    } catch (err) {
        throw new Error("Failed to generate resume HTML. Please try again.")
    }
}

async function generateResumePDF({ resume, selfDescription, jobDescription, html }) {
    try {
        const resumeHtml = normalizeTextBlock(html)
            ? sanitizeHtmlDocument(html)
            : await generateResumeHtml({ resume, selfDescription, jobDescription })

        return {
            html: resumeHtml,
            pdfBuffer: await generatePDFFromHTML(resumeHtml)
        }
    } catch (err) {
        if (err.message === "Failed to generate PDF from HTML content") {
            throw err
        }

        throw new Error("Failed to generate resume PDF. Please try again.")
    }
}

module.exports = {
    analyzeResume,
    generateInterviewReport,
    generateAptitudeQuestions,
    generateTechnicalDSAQuestions,
    generateResumeHtml,
    generateResumePDF
}
