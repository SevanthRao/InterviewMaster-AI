import { apiClient } from "../../shared/api.client"

/**
 * @description Create a new session (analyze resume)
 */
export const createSession = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData()
    formData.append("jobDescription", jobDescription)
    formData.append("selfDescription", selfDescription)
    formData.append("resume", resumeFile)

    const response = await apiClient.post("/api/session/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return response.data
}

/**
 * @description Get session by ID
 */
export const getSessionById = async (sessionId) => {
    const response = await apiClient.get(`/api/session/${sessionId}`)
    return response.data
}

/**
 * @description Update editable session data
 */
export const updateSession = async (sessionId, payload) => {
    const response = await apiClient.patch(`/api/session/${sessionId}`, payload)
    return response.data
}

/**
 * @description Get all sessions
 */
export const getAllSessions = async () => {
    const response = await apiClient.get("/api/session/")
    return response.data
}

/**
 * @description Generate interview report for a session
 */
export const generateInterviewReport = async (sessionId) => {
    const response = await apiClient.post(`/api/interview/${sessionId}/generate`)
    return response.data
}

/**
 * @description Get interview report for a session
 */
export const getInterviewReport = async (sessionId) => {
    const response = await apiClient.get(`/api/interview/${sessionId}`)
    return response.data
}

/**
 * @description Generate resume PDF for a session
 */
export const generateResumePDF = async (sessionId) => {
    const response = await apiClient.post(`/api/interview/${sessionId}/resume/pdf`, null, {
        responseType: "blob"
    })
    return response.data
}

/**
 * @description Generate aptitude test for a session
 */
export const generateAptitudeTest = async (sessionId, { timeLimit, questionCount }) => {
    const response = await apiClient.post(`/api/aptitude/${sessionId}/generate`, {
        timeLimit,
        questionCount
    })
    return response.data
}

/**
 * @description Get aptitude test by ID
 */
export const getAptitudeTest = async (testId) => {
    const response = await apiClient.get(`/api/aptitude/${testId}`)
    return response.data
}

/**
 * @description Submit aptitude test answers
 */
export const submitAptitudeTest = async (testId, answers) => {
    const response = await apiClient.post(`/api/aptitude/${testId}/submit`, { answers })
    return response.data
}

/**
 * @description Generate technical test for a session
 */
export const generateTechnicalTest = async (sessionId) => {
    const response = await apiClient.post(`/api/technical/${sessionId}/generate`)
    return response.data
}

/**
 * @description Get technical test by ID
 */
export const getTechnicalTest = async (testId) => {
    const response = await apiClient.get(`/api/technical/${testId}`)
    return response.data
}

/**
 * @description Submit technical test answers
 */
export const submitTechnicalTest = async (testId, answers) => {
    const response = await apiClient.post(`/api/technical/${testId}/submit`, { answers })
    return response.data
}
