const pdfParse = require("pdf-parse")
const mongoose = require("mongoose")
const { analyzeResume } = require("../services/ai.service")
const sessionModel = require("../models/session.model")
const interviewReportModel = require("../models/interviewReport.model")
const aptitudeTestModel = require("../models/aptitudeTest.model")
const technicalTestModel = require("../models/technicalTest.model")

const SKILL_GAP_SEVERITIES = new Set(["low", "medium", "high"])

function normalizeText(value) {
    return typeof value === "string" ? value.trim() : ""
}

function parseMatchScore(value) {
    const parsedValue = Number(value)

    if (!Number.isFinite(parsedValue)) {
        return null
    }

    return Math.min(100, Math.max(0, Math.round(parsedValue)))
}

function normalizeSkillGaps(skillGaps) {
    if (!Array.isArray(skillGaps)) {
        return { error: "Skill gaps must be an array" }
    }

    const normalizedSkillGaps = []

    for (const skillGap of skillGaps) {
        const skill = normalizeText(skillGap?.skill)
        const severity = normalizeText(skillGap?.severity).toLowerCase()

        if (!skill) {
            continue
        }

        if (!SKILL_GAP_SEVERITIES.has(severity)) {
            return { error: "Each skill gap severity must be low, medium, or high" }
        }

        normalizedSkillGaps.push({ skill, severity })
    }

    return { value: normalizedSkillGaps }
}

function isValidSessionId(sessionId) {
    return mongoose.Types.ObjectId.isValid(sessionId)
}

async function findOwnedSession(sessionId, userId) {
    return sessionModel.findOne({
        _id: sessionId,
        user: userId
    })
}

async function invalidateGeneratedArtifacts(sessionId, userId) {
    await Promise.all([
        interviewReportModel.deleteMany({ session: sessionId, user: userId }),
        aptitudeTestModel.deleteMany({ session: sessionId, user: userId }),
        technicalTestModel.deleteMany({ session: sessionId, user: userId })
    ])
}

async function createSessionController(req, res) {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ message: "Resume file (PDF) is required" })
        }

        const selfDescription = normalizeText(req.body.selfDescription)
        const jobDescription = normalizeText(req.body.jobDescription)

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required" })
        }

        if (!selfDescription) {
            return res.status(400).json({ message: "Self description is required" })
        }

        let resumeContent

        try {
            resumeContent = await pdfParse(req.file.buffer)
        } catch (pdfErr) {
            console.error("PDF parse error:", pdfErr.message)
            return res.status(400).json({ message: "Failed to parse the uploaded PDF. Please upload a valid resume file." })
        }

        const resume = normalizeText(resumeContent?.text)

        if (!resume) {
            return res.status(400).json({ message: "Could not extract text from the uploaded PDF. Please upload a valid resume." })
        }

        const analysis = await analyzeResume({
            resume,
            selfDescription,
            jobDescription
        })

        const session = await sessionModel.create({
            user: req.user.id,
            resume,
            selfDescription,
            jobDescription,
            title: analysis.title,
            matchScore: analysis.matchScore,
            skillGaps: analysis.skillGaps
        })

        res.status(201).json({
            message: "Resume analyzed successfully",
            session
        })
    } catch (err) {
        console.error("Create session error:", err.message)

        if (err.message.includes("Failed to analyze resume")) {
            return res.status(502).json({ message: "AI service is temporarily unavailable. Please try again later." })
        }

        res.status(500).json({ message: "Failed to analyze resume. Please try again." })
    }
}

async function getSessionByIdController(req, res) {
    try {
        const { sessionId } = req.params

        if (!isValidSessionId(sessionId)) {
            return res.status(400).json({ message: "Invalid session ID" })
        }

        const session = await findOwnedSession(sessionId, req.user.id)

        if (!session) {
            return res.status(404).json({ message: "Session not found" })
        }

        res.status(200).json({
            message: "Session fetched successfully",
            session
        })
    } catch (err) {
        console.error("Get session error:", err.message)
        res.status(500).json({ message: "Internal server error" })
    }
}

async function updateSessionController(req, res) {
    try {
        const { sessionId } = req.params

        if (!isValidSessionId(sessionId)) {
            return res.status(400).json({ message: "Invalid session ID" })
        }

        const title = normalizeText(req.body.title)
        const resume = normalizeText(req.body.resume)
        const selfDescription = normalizeText(req.body.selfDescription)
        const jobDescription = normalizeText(req.body.jobDescription)
        const matchScore = parseMatchScore(req.body.matchScore)
        const normalizedSkillGaps = normalizeSkillGaps(req.body.skillGaps)

        if (!title || !resume || !selfDescription || !jobDescription) {
            return res.status(400).json({
                message: "Title, resume, self description, and job description are required"
            })
        }

        if (matchScore === null) {
            return res.status(400).json({
                message: "Match score must be a number between 0 and 100"
            })
        }

        if (normalizedSkillGaps.error) {
            return res.status(400).json({ message: normalizedSkillGaps.error })
        }

        const session = await findOwnedSession(sessionId, req.user.id)

        if (!session) {
            return res.status(404).json({ message: "Session not found" })
        }

        session.title = title
        session.resume = resume
        session.selfDescription = selfDescription
        session.jobDescription = jobDescription
        session.matchScore = matchScore
        session.skillGaps = normalizedSkillGaps.value
        session.refinedResumeHtml = ""

        await session.save()
        await invalidateGeneratedArtifacts(sessionId, req.user.id)

        res.status(200).json({
            message: "Session updated successfully. Generated materials were cleared and should be regenerated.",
            session
        })
    } catch (err) {
        console.error("Update session error:", err.message)
        res.status(500).json({ message: "Failed to update session. Please try again." })
    }
}

async function getAllSessionsController(req, res) {
    try {
        const sessions = await sessionModel.find({
            user: req.user.id
        }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -refinedResumeHtml -__v")

        res.status(200).json({
            message: "Sessions fetched successfully",
            sessions
        })
    } catch (err) {
        console.error("Get all sessions error:", err.message)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    createSessionController,
    getSessionByIdController,
    updateSessionController,
    getAllSessionsController
}
