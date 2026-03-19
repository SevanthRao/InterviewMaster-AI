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

module.exports = interviewRouter