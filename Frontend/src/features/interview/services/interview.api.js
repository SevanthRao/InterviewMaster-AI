import { apiClient } from "../../../lib/api.client"

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
 * @description Get session by ID (needed for Interview page sidebar)
 */
export const getSessionById = async (sessionId) => {
    const response = await apiClient.get(`/api/session/${sessionId}`)
    return response.data
}
