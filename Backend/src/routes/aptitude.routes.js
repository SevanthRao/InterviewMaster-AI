const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const aptitudeController = require("../controllers/aptitude.controller")

const aptitudeRouter = express.Router()

/**
 * @route POST /api/aptitude/:sessionId/generate
 * @description Generate aptitude test for a session
 * @access private
 */
aptitudeRouter.post("/:sessionId/generate", authMiddleware.authUser, aptitudeController.generateAptitudeTestController)

/**
 * @route GET /api/aptitude/:testId
 * @description Get aptitude test by ID
 * @access private
 */
aptitudeRouter.get("/:testId", authMiddleware.authUser, aptitudeController.getAptitudeTestController)

/**
 * @route POST /api/aptitude/:testId/submit
 * @description Submit aptitude test answers
 * @access private
 */
aptitudeRouter.post("/:testId/submit", authMiddleware.authUser, aptitudeController.submitAptitudeTestController)

module.exports = aptitudeRouter
