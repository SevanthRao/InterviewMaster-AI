const mongoose = require("mongoose")
const { generateTechnicalDSAQuestions } = require("../services/ai.service")
const technicalTestModel = require("../models/technicalTest.model")
const sessionModel = require("../models/session.model")

/**
 * @description Generate technical DSA test for a session.
 * @access private
 */
async function generateTechnicalTestController(req, res) {
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

        const questions = await generateTechnicalDSAQuestions({
            resume: session.resume,
            jobDescription: session.jobDescription
        })

        const questionsWithDefaults = questions.map(q => ({
            ...q,
            userAnswer: "",
            isCorrect: null
        }))

        const technicalTest = await technicalTestModel.create({
            session: sessionId,
            user: req.user.id,
            questions: questionsWithDefaults
        })

        // Return test without correct answers
        const safeTest = technicalTest.toObject()
        safeTest.questions = safeTest.questions.map(q => ({
            question: q.question,
            difficulty: q.difficulty,
            userAnswer: q.userAnswer
        }))

        res.status(201).json({
            message: "Technical test generated successfully",
            technicalTest: safeTest
        })
    } catch (err) {
        console.error("Generate technical test error:", err.message)

        if (err.message.includes("Failed to generate technical")) {
            return res.status(502).json({ message: "AI service is temporarily unavailable. Please try again later." })
        }

        res.status(500).json({ message: "Failed to generate technical test. Please try again." })
    }
}


/**
 * @description Get a technical test by ID.
 * @access private
 */
async function getTechnicalTestController(req, res) {
    try {
        const { testId } = req.params

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" })
        }

        const technicalTest = await technicalTestModel.findOne({
            _id: testId,
            user: req.user.id
        })

        if (!technicalTest) {
            return res.status(404).json({ message: "Technical test not found" })
        }

        if (!technicalTest.submitted) {
            const safeTest = technicalTest.toObject()
            safeTest.questions = safeTest.questions.map(q => ({
                question: q.question,
                difficulty: q.difficulty,
                userAnswer: q.userAnswer
            }))
            return res.status(200).json({
                message: "Technical test fetched successfully",
                technicalTest: safeTest
            })
        }

        res.status(200).json({
            message: "Technical test fetched successfully",
            technicalTest
        })
    } catch (err) {
        console.error("Get technical test error:", err.message)
        res.status(500).json({ message: "Internal server error" })
    }
}


/**
 * @description Submit technical test answers and calculate score.
 * @access private
 */
async function submitTechnicalTestController(req, res) {
    try {
        const { testId } = req.params
        const { answers } = req.body // array of strings

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" })
        }

        if (!Array.isArray(answers)) {
            return res.status(400).json({ message: "Answers must be an array" })
        }

        const technicalTest = await technicalTestModel.findOne({
            _id: testId,
            user: req.user.id
        })

        if (!technicalTest) {
            return res.status(404).json({ message: "Technical test not found" })
        }

        if (technicalTest.submitted) {
            return res.status(400).json({ message: "Test already submitted" })
        }

        if (answers.length > technicalTest.questions.length) {
            return res.status(400).json({ message: "Too many answers submitted" })
        }

        const hasInvalidAnswerType = answers.some((answer) => {
            return answer !== undefined && answer !== null && typeof answer !== "string"
        })

        if (hasInvalidAnswerType) {
            return res.status(400).json({ message: "Each answer must be a string" })
        }

        // Calculate score — case-insensitive comparison, trimmed
        let score = 0
        technicalTest.questions.forEach((q, i) => {
            const rawAnswer = typeof answers[i] === "string" ? answers[i] : ""
            const userAns = rawAnswer.trim().toLowerCase()
            const correctAns = String(q.correctAnswer || "").trim().toLowerCase()
            q.userAnswer = rawAnswer
            q.isCorrect = Boolean(userAns) && userAns === correctAns
            if (q.isCorrect) score++
        })

        technicalTest.score = score
        technicalTest.submitted = true
        technicalTest.completedAt = new Date()

        await technicalTest.save()

        res.status(200).json({
            message: "Technical test submitted successfully",
            technicalTest
        })
    } catch (err) {
        console.error("Submit technical test error:", err.message)
        res.status(500).json({ message: "Internal server error" })
    }
}


module.exports = {
    generateTechnicalTestController,
    getTechnicalTestController,
    submitTechnicalTestController
}
