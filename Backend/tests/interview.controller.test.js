const test = require("node:test")
const assert = require("node:assert/strict")

const aiService = require("../src/services/ai.service")
const sessionModel = require("../src/models/session.model")

const controllerPath = require.resolve("../src/controllers/interview.controller")
const VALID_SESSION_ID = "507f1f77bcf86cd799439011"
const VALID_USER_ID = "507f191e810c19729de860ea"

function createResponse() {
    return {
        headers: {},
        statusCode: 200,
        sentBody: null,
        status(code) {
            this.statusCode = code
            return this
        },
        json(payload) {
            this.body = payload
            return this
        },
        set(headers) {
            this.headers = { ...this.headers, ...headers }
            return this
        },
        send(payload) {
            this.sentBody = payload
            return this
        }
    }
}

function loadInterviewController() {
    delete require.cache[controllerPath]
    return require(controllerPath)
}

test("generateResumePDFController stores generated HTML on the session", async (t) => {
    const originalFindOne = sessionModel.findOne
    const originalGenerateResumePDF = aiService.generateResumePDF

    let saveCalls = 0

    const fakeSession = {
        resume: "Resume text",
        selfDescription: "Self description",
        jobDescription: "Job description",
        refinedResumeHtml: "",
        async save() {
            saveCalls += 1
            return this
        }
    }

    sessionModel.findOne = async () => fakeSession
    aiService.generateResumePDF = async (input) => ({
        html: input.html || "<html><body>Generated Resume</body></html>",
        pdfBuffer: Buffer.from("pdf-binary")
    })

    t.after(() => {
        sessionModel.findOne = originalFindOne
        aiService.generateResumePDF = originalGenerateResumePDF
        delete require.cache[controllerPath]
    })

    const { generateResumePDFController } = loadInterviewController()
    const req = {
        params: { sessionId: VALID_SESSION_ID },
        user: { id: VALID_USER_ID }
    }
    const res = createResponse()

    await generateResumePDFController(req, res)

    assert.equal(res.statusCode, 200)
    assert.equal(res.headers["Content-Type"], "application/pdf")
    assert.equal(res.headers["Content-Disposition"], `attachment; filename=resume_${VALID_SESSION_ID}.pdf`)
    assert.deepEqual(res.sentBody, Buffer.from("pdf-binary"))
    assert.equal(fakeSession.refinedResumeHtml, "<html><body>Generated Resume</body></html>")
    assert.equal(saveCalls, 1)
})
