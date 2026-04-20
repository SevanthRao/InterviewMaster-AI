import { apiClient } from "../../../lib/api.client"

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
