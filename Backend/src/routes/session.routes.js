const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const sessionController = require("../controllers/session.controller")
const upload = require("../middlewares/file.middleware")

const sessionRouter = express.Router()

/**
 * @route POST /api/session/
 * @description Create a new session (analyze resume)
 * @access private
 */
sessionRouter.post("/", authMiddleware.authUser, upload.single("resume"), sessionController.createSessionController)

/**
 * @route GET /api/session/:sessionId
 * @description Get session by ID
 * @access private
 */
sessionRouter.get("/:sessionId", authMiddleware.authUser, sessionController.getSessionByIdController)

/**
 * @route PATCH /api/session/:sessionId
 * @description Update editable session fields
 * @access private
 */
sessionRouter.patch("/:sessionId", authMiddleware.authUser, sessionController.updateSessionController)

/**
 * @route GET /api/session/
 * @description Get all sessions for the logged-in user
 * @access private
 */
sessionRouter.get("/", authMiddleware.authUser, sessionController.getAllSessionsController)

module.exports = sessionRouter
