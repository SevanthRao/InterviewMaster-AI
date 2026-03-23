const pdfParse = require("pdf-parse")
const mongoose = require("mongoose")
const {generateInterviewReport,  generateResumePDF } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")


/**
 * @description Generate new interview report for a candidate based on their resume, self description and job description.
 * @access private
 */
async function generateInterviewController(req, res){
    try {
        const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()

        const { selfDescription, jobDescription } = req.body

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeContent.text,
            selfDescription,
            jobDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        })

        res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        })
    }
    catch (err) {
        console.log(err)
    }
}

/**
 * @description Get interview report by interview ID.
 * @access private
 */
async function getInterviewByIdController(req, res){
    try {
        const { interviewId } = req.params

        if (!mongoose.Types.ObjectId.isValid(interviewId)) {
            return res.status(400).json({
                message: "Invalid interview ID"
            })
        }

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewId,
            user: req.user.id
        })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            })
        }

        res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        })
    } 
    catch (err) {
        console.log(err)
    }
}


/**
 * @description Get all interview reports of the logged in user.
 * @access private
 */
async function getAllInterviewsController(req, res){
    try {
        const interviewReports = await interviewReportModel.find({
            user: req.user.id
        }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports
        })
    } 
    catch (err) {
        console.log(err)
    }
}


/**
 * @description Generate PDF for a candidate's resume based on user selfDescription, jobDescription and resume.
 */
async function generateResumePDFController(req, res) {
        const { interviewReportID } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportID)

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            })
        }

        const { resume, selfDescription, jobDescription } = interviewReport

        const pdfBuffer = await generateResumePDF({
            resume,
            selfDescription,
            jobDescription
        })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportID}.pdf`
        })
        res.send(pdfBuffer)
}

module.exports = {  
    generateInterviewController,
    getInterviewByIdController,
    getAllInterviewsController,
    generateResumePDFController
}

