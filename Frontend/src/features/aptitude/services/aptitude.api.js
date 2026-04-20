import { apiClient } from "../../../lib/api.client"

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
