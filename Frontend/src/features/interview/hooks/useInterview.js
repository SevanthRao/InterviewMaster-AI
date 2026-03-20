import { useContext, useEffect } from "react"
import  { InterviewContext } from "../interview.context"
import { generateInterviewReport, getInterviewReportById, getAllInterviewReports } from "../services/interview.api"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setloading, report, setReport, reports, setReports } = context

    const handlegenerateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setloading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            setReport(response.interviewReport)
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setloading(false)
        }
        return response.interviewReport
    }

    const handleGetInterviewReportById = async (interviewId) => {
        setloading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response.interviewReport)
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setloading(false)
        }
        return response.interviewReport
    }

    const handleGetAllInterviewReports = async () => {
        setloading(true)
        let response = null
        try {
            const response = await getAllInterviewReports()
            setReports(response.interviewReports)
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setloading(false)
        }
            return response.interviewReports
    }

    useEffect(() => {
        if (interviewId) {
            handleGetInterviewReportById(interviewId)
        } else {
            handleGetAllInterviewReports()
        }
    }, [interviewId])

    return { loading, report, reports, handlegenerateInterviewReport, handleGetInterviewReportById, handleGetAllInterviewReports }

}