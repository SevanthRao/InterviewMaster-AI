import { apiClient } from "../../../lib/api.client"

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
 * @description Generate resume PDF for a session
 */
export const generateResumePDF = async (sessionId) => {
    const response = await apiClient.post(`/api/interview/${sessionId}/resume/pdf`, null, {
        responseType: "blob"
    })
    return response.data
}
