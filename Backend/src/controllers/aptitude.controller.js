const mongoose = require("mongoose")
const { generateAptitudeQuestions } = require("../services/ai.service")
const aptitudeTestModel = require("../models/aptitudeTest.model")
const sessionModel = require("../models/session.model")
const { prependHistoryEntry } = require("../utils/session-history")

/**
 * @description Generate aptitude test for a session.
 * @access private
 */
async function generateAptitudeTestController(req, res) {
    try {
        const { sessionId } = req.params
        const { timeLimit, questionCount } = req.body
        const parsedTimeLimit = Number(timeLimit)
        const parsedQuestionCount = Number(questionCount)

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ message: "Invalid session ID" })
        }

        if (!Number.isInteger(parsedTimeLimit) || parsedTimeLimit < 5 || parsedTimeLimit > 60) {
            return res.status(400).json({ message: "Time limit must be between 5 and 60 minutes" })
        }

        if (!Number.isInteger(parsedQuestionCount) || parsedQuestionCount < 5 || parsedQuestionCount > 30) {
            return res.status(400).json({ message: "Question count must be between 5 and 30" })
        }

        const session = await sessionModel.findOne({
            _id: sessionId,
            user: req.user.id
        })

        if (!session) {
            return res.status(404).json({ message: "Session not found" })
        }

        const questions = await generateAptitudeQuestions({
            resume: session.resume,
            jobDescription: session.jobDescription,
            count: parsedQuestionCount
        })

        // Initialize all userAnswer to -1
        const questionsWithDefaults = questions.map(q => ({
            ...q,
            userAnswer: -1
        }))

        const aptitudeTest = await aptitudeTestModel.create({
            session: sessionId,
            user: req.user.id,
            timeLimit: parsedTimeLimit,
            totalQuestions: questions.length,
            questions: questionsWithDefaults
        })

        prependHistoryEntry(session, {
            type: "aptitude_generated",
            label: "Aptitude test generated",
            detail: `${questions.length} aptitude questions generated with a ${parsedTimeLimit}-minute limit.`
        })
        await session.save()

        // Return test without correct answers (don't reveal during test)
        const safeTest = aptitudeTest.toObject()
        safeTest.questions = safeTest.questions.map(q => ({
            question: q.question,
            options: q.options,
            userAnswer: q.userAnswer
        }))

        res.status(201).json({
            message: "Aptitude test generated successfully",
            aptitudeTest: safeTest
        })
    } catch (err) {
        console.error("Generate aptitude test error:", err.message)

        if (err.message.includes("Failed to generate aptitude")) {
            return res.status(502).json({ message: "AI service is temporarily unavailable. Please try again later." })
        }

        res.status(500).json({ message: "Failed to generate aptitude test. Please try again." })
    }
}


/**
 * @description Get an aptitude test by ID (hides answers if not submitted).
 * @access private
 */
async function getAptitudeTestController(req, res) {
    try {
        const { testId } = req.params

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" })
        }

        const aptitudeTest = await aptitudeTestModel.findOne({
            _id: testId,
            user: req.user.id
        })

        if (!aptitudeTest) {
            return res.status(404).json({ message: "Aptitude test not found" })
        }

        // If not submitted, hide correct answers and explanations
        if (!aptitudeTest.submitted) {
            const safeTest = aptitudeTest.toObject()
            safeTest.questions = safeTest.questions.map(q => ({
                question: q.question,
                options: q.options,
                userAnswer: q.userAnswer
            }))
            return res.status(200).json({
                message: "Aptitude test fetched successfully",
                aptitudeTest: safeTest
            })
        }

        res.status(200).json({
            message: "Aptitude test fetched successfully",
            aptitudeTest
        })
    } catch (err) {
        console.error("Get aptitude test error:", err.message)
        res.status(500).json({ message: "Internal server error" })
    }
}


/**
 * @description Submit aptitude test answers and calculate score.
 * @access private
 */
async function submitAptitudeTestController(req, res) {
    try {
        const { testId } = req.params
        const { answers } = req.body // array of numbers (indices)

        if (!mongoose.Types.ObjectId.isValid(testId)) {
            return res.status(400).json({ message: "Invalid test ID" })
        }

        if (!Array.isArray(answers)) {
            return res.status(400).json({ message: "Answers must be an array" })
        }

        const aptitudeTest = await aptitudeTestModel.findOne({
            _id: testId,
            user: req.user.id
        })

        if (!aptitudeTest) {
            return res.status(404).json({ message: "Aptitude test not found" })
        }

        if (aptitudeTest.submitted) {
            return res.status(400).json({ message: "Test already submitted" })
        }

        if (answers.length > aptitudeTest.questions.length) {
            return res.status(400).json({ message: "Too many answers submitted" })
        }

        const hasInvalidAnswer = answers.some((answer) => {
            if (answer === undefined || answer === null || answer === "") {
                return false
            }

            const parsedAnswer = Number(answer)
            return !Number.isInteger(parsedAnswer) || parsedAnswer < 0 || parsedAnswer > 3
        })

        if (hasInvalidAnswer) {
            return res.status(400).json({ message: "Each answer must be an integer between 0 and 3" })
        }

        // Calculate score and update answers
        let score = 0
        aptitudeTest.questions.forEach((q, i) => {
            const parsedAnswer = Number(answers[i])
            const userAns = Number.isInteger(parsedAnswer) ? parsedAnswer : -1
            q.userAnswer = userAns
            if (userAns === q.correctAnswer) {
                score++
            }
        })

        aptitudeTest.score = score
        aptitudeTest.submitted = true
        aptitudeTest.completedAt = new Date()

        await aptitudeTest.save()

        res.status(200).json({
            message: "Aptitude test submitted successfully",
            aptitudeTest
        })
    } catch (err) {
        console.error("Submit aptitude test error:", err.message)
        res.status(500).json({ message: "Internal server error" })
    }
}


module.exports = {
    generateAptitudeTestController,
    getAptitudeTestController,
    submitAptitudeTestController
}
