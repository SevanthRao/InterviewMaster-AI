const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()
/**
 * @route post /api/interview/
 * description Generate new interview report for a candidate based on their resume, self description and job description.
 * access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewController)


/**
 * @route get /api/interview/report/:interviewId
 * description Get interview report by interview ID.
 * access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.getInterviewByIdController)


/**
 * @route get /api/interview/
 * description Get all interview reports of the logged in user.
 * access private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewsController)


/**
 * @route post /api/interview/resume/pdf
 * @description Generate PDF for a candidate's resume based on user selfDescription, jobDescription and resume.
 * @access private
 */
interviewRouter.post("/resume/pdf/:interviewReportID", authMiddleware.authUser, interviewController.generateResumePDFController)

module.exports = interviewRouter