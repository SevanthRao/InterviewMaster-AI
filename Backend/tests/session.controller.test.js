const test = require("node:test")
const assert = require("node:assert/strict")

const sessionModel = require("../src/models/session.model")
const interviewReportModel = require("../src/models/interviewReport.model")
const aptitudeTestModel = require("../src/models/aptitudeTest.model")
const technicalTestModel = require("../src/models/technicalTest.model")
const { updateSessionController } = require("../src/controllers/session.controller")

const VALID_SESSION_ID = "507f1f77bcf86cd799439011"
const VALID_USER_ID = "507f191e810c19729de860ea"

function createResponse() {
    return {
        headers: {},
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code
            return this
        },
        json(payload) {
            this.body = payload
            return this
        }
    }
}

test("updateSessionController saves edited session data and clears generated artifacts", async (t) => {
    const originalFindOne = sessionModel.findOne
    const originalDeleteInterviewReports = interviewReportModel.deleteMany
    const originalDeleteAptitudeTests = aptitudeTestModel.deleteMany
    const originalDeleteTechnicalTests = technicalTestModel.deleteMany

    const deletionQueries = []
    let saveCalls = 0

    const fakeSession = {
        title: "Old Title",
        resume: "Old resume",
        selfDescription: "Old self description",
        jobDescription: "Old job description",
        matchScore: 45,
        skillGaps: [{ skill: "React", severity: "high" }],
        refinedResumeHtml: "<html>old</html>",
        async save() {
            saveCalls += 1
            return this
        }
    }

    sessionModel.findOne = async () => fakeSession
    interviewReportModel.deleteMany = async (query) => {
        deletionQueries.push(query)
        return { acknowledged: true }
    }
    aptitudeTestModel.deleteMany = async (query) => {
        deletionQueries.push(query)
        return { acknowledged: true }
    }
    technicalTestModel.deleteMany = async (query) => {
        deletionQueries.push(query)
        return { acknowledged: true }
    }

    t.after(() => {
        sessionModel.findOne = originalFindOne
        interviewReportModel.deleteMany = originalDeleteInterviewReports
        aptitudeTestModel.deleteMany = originalDeleteAptitudeTests
        technicalTestModel.deleteMany = originalDeleteTechnicalTests
    })

    const req = {
        params: { sessionId: VALID_SESSION_ID },
        user: { id: VALID_USER_ID },
        body: {
            title: "Updated Title",
            resume: "Updated resume text",
            selfDescription: "Updated self description",
            jobDescription: "Updated job description",
            matchScore: 82,
            skillGaps: [
                { skill: "Docker", severity: "medium" },
                { skill: "Communication", severity: "low" }
            ]
        }
    }
    const res = createResponse()

    await updateSessionController(req, res)

    assert.equal(res.statusCode, 200)
    assert.equal(saveCalls, 1)
    assert.equal(fakeSession.title, "Updated Title")
    assert.equal(fakeSession.resume, "Updated resume text")
    assert.equal(fakeSession.selfDescription, "Updated self description")
    assert.equal(fakeSession.jobDescription, "Updated job description")
    assert.equal(fakeSession.matchScore, 82)
    assert.equal(fakeSession.refinedResumeHtml, "")
    assert.deepEqual(fakeSession.skillGaps, [
        { skill: "Docker", severity: "medium" },
        { skill: "Communication", severity: "low" }
    ])
    assert.equal(deletionQueries.length, 3)
    assert.match(res.body.message, /Generated materials were cleared/i)
})

test("updateSessionController rejects invalid skill gap severities", async (t) => {
    const originalFindOne = sessionModel.findOne
    sessionModel.findOne = async () => {
        throw new Error("findOne should not be called for invalid input")
    }

    t.after(() => {
        sessionModel.findOne = originalFindOne
    })

    const req = {
        params: { sessionId: VALID_SESSION_ID },
        user: { id: VALID_USER_ID },
        body: {
            title: "Updated Title",
            resume: "Updated resume text",
            selfDescription: "Updated self description",
            jobDescription: "Updated job description",
            matchScore: 82,
            skillGaps: [{ skill: "Docker", severity: "urgent" }]
        }
    }
    const res = createResponse()

    await updateSessionController(req, res)

    assert.equal(res.statusCode, 400)
    assert.equal(res.body.message, "Each skill gap severity must be low, medium, or high")
})
