import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})


/**
 * @description Generate new interview report for a candidate based on their resume, self description and job description.
 */
export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    try {
        const formData = new FormData()
        formData.append("jobDescription", jobDescription)
        formData.append("selfDescription", selfDescription)
        formData.append("resume", resumeFile)

        const response = await api.post("/api/interview/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })

        return response.data
    } catch (err) {
        console.log(err)
    }
}

/**
 * @description Get interview report by interview ID.
 */
export const getInterviewReportById = async (interviewId) => {
    try {
        const response = await api.get(`/api/interview/report/${interviewId}`)
        return response.data
    } catch (err) {
        console.log(err)
    }
}

/**
 * @description Get all interview reports.
 */
export const getAllInterviewReports = async () => {
    try {
        const response = await api.get("/api/interview/")
        return response.data
    } catch (err) {
        console.log(err)
    }
}

/**
 * @description Generate a PDF resume for a candidate based on their interview report.
 */
export const generateResumePDF = async (interviewReportID) => {
    try {
        const response = await api.post(`/api/interview/resume/pdf/${interviewReportID}`, null, {
            responseType: "blob"
        }
        )
        return response.data

    }
    catch (err) {
        console.log(err)
    }
}