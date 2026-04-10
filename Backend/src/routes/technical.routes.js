const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const technicalController = require("../controllers/technical.controller")

const technicalRouter = express.Router()

/**
 * @route POST /api/technical/:sessionId/generate
 * @description Generate technical DSA test for a session
 * @access private
 */
technicalRouter.post("/:sessionId/generate", authMiddleware.authUser, technicalController.generateTechnicalTestController)

/**
 * @route GET /api/technical/:testId
 * @description Get technical test by ID
 * @access private
 */
technicalRouter.get("/:testId", authMiddleware.authUser, technicalController.getTechnicalTestController)

/**
 * @route POST /api/technical/:testId/submit
 * @description Submit technical test answers
 * @access private
 */
technicalRouter.post("/:testId/submit", authMiddleware.authUser, technicalController.submitTechnicalTestController)

module.exports = technicalRouter
