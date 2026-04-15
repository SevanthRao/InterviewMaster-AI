const mongoose = require("mongoose")
const { generateInterviewReport, generateResumePDF } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")
const sessionModel = require("../models/session.model")
const { prependHistoryEntry } = require("../utils/session-history")


/**
 * @description Generate interview report (technical + behavioral + roadmap) for a session.
 * @access private
 */
async function generateInterviewController(req, res) {
    try {
        const { sessionId } = req.params

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: "Invalid session ID" })
        }

        const session = await sessionModel.findOne({
            _id: sessionId,
            user: req.user.id
        })

        if (!session) {
            return res.status(404).json({ message: "Session not found" })
        }

        // Check if report already exists for this session
        const existingReport = await interviewReportModel.findOne({
            session: sessionId,
            user: req.user.id
        })

        if (existingReport) {
            prependHistoryEntry(session, {
                type: "interview_report_reused",
                label: "Interview approach opened",
                detail: "Existing interview approach was reused."
            })
            await session.save()

            return res.status(200).json({
                message: "Interview report already exists",
                interviewReport: existingReport
            })
        }

        const interviewReportByAi = await generateInterviewReport({
            resume: session.resume,
            selfDescription: session.selfDescription,
            jobDescription: session.jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            session: sessionId,
            user: req.user.id,
            ...interviewReportByAi
        })

        prependHistoryEntry(session, {
            type: "interview_report_generated",
            label: "Interview approach generated",
            detail: "Technical, behavioral, and roadmap content was generated."
        })
        await session.save()

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })
    } catch (err) {
        console.error("Generate interview error:", err.message)

        if (err.message.includes("Failed to generate interview report from AI")) {
            return res.status(502).json({ message: "AI service is temporarily unavailable. Please try again later." })
        }

        res.status(500).json({ message: "Failed to generate interview report. Please try again." })
    }
}


/**
 * @description Get interview report for a session.
 * @access private
 */
async function getInterviewBySessionController(req, res) {
    try {
        const { sessionId } = req.params

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: "Invalid session ID" })
        }

        const interviewReport = await interviewReportModel.findOne({
            session: sessionId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found. Generate one first." })
        }

        res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        })
    } catch (err) {
        console.error("Get interview error:", err.message)
        res.status(500).json({ message: "Internal server error" })
    }
}


/**
 * @description Generate PDF resume for a session.
 * @access private
 */
async function generateResumePDFController(req, res) {
    try {
        const { sessionId } = req.params

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: "Invalid session ID" })
        }

        const session = await sessionModel.findOne({
            _id: sessionId,
            user: req.user.id
        })

        if (!session) {
            return res.status(404).json({ message: "Session not found" })
        }

        const resumeDocument = await generateResumePDF({
            resume: session.resume,
            selfDescription: session.selfDescription,
            jobDescription: session.jobDescription,
            html: session.refinedResumeHtml
        })

        if (resumeDocument.html && resumeDocument.html !== session.refinedResumeHtml) {
            session.refinedResumeHtml = resumeDocument.html
        }

        prependHistoryEntry(session, {
            type: "resume_generated",
            label: "AI resume generated",
            detail: "A refined resume PDF was generated for this session."
        })
        await session.save()

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${sessionId}.pdf`
        })
        res.send(resumeDocument.pdfBuffer)
    } catch (err) {
        console.error("Generate resume PDF error:", err.message)

        if (err.message.includes("Failed to generate resume PDF")) {
            return res.status(502).json({ message: "AI service is temporarily unavailable. Please try again later." })
        }

        res.status(500).json({ message: "Failed to generate resume PDF. Please try again." })
    }
}


module.exports = {
    generateInterviewController,
    getInterviewBySessionController,
    generateResumePDFController
}
