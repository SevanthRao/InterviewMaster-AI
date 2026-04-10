const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")

const interviewRouter = express.Router()

/**
 * @route POST /api/interview/:sessionId/generate
 * @description Generate interview Q&A for a session
 * @access private
 */
interviewRouter.post("/:sessionId/generate", authMiddleware.authUser, interviewController.generateInterviewController)

/**
 * @route GET /api/interview/:sessionId
 * @description Get interview report for a session
 * @access private
 */
interviewRouter.get("/:sessionId", authMiddleware.authUser, interviewController.getInterviewBySessionController)

/**
 * @route POST /api/interview/:sessionId/resume/pdf
 * @description Generate PDF resume for a session
 * @access private
 */
interviewRouter.post("/:sessionId/resume/pdf", authMiddleware.authUser, interviewController.generateResumePDFController)

module.exports = interviewRouter