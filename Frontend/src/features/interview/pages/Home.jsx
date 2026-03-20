import React, { useState, useRef } from 'react'
import { useInterview } from '../hooks/useInterview';
import { useNavigate } from 'react-router';


const Home = () => {

  const { loading, handlegenerateInterviewReport, reports } = useInterview()
  const [jobDescription, setjobDescription] = useState("")
  const [selfDescription, setselfDescription] = useState("")
  const resumeInputRef = useRef()

  const navigate = useNavigate()

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current.files[0]
    const data = await handlegenerateInterviewReport({ jobDescription, selfDescription, resumeFile })
    navigate(`/interview/${data._id}`)
  }

  if (loading) {
    return <main className='min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000]'>
      <h1 className='text-4xl font-semibold text-white text-bold'>Loading.........</h1>
    </main>
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000]">

      <div className="w-full max-w-4xl px-6 py-8 rounded-2xl backdrop-blur-lg bg-white/5 border border-white/10 shadow-lg">

        <h1 className="text-3xl font-semibold text-white mb-8 text-center">
          InterviewMaster <br /> Your AI Interview Assistant
        </h1>

        {/* 2 Column Layout */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT - Job Description */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 text-sm">
              Job Description
            </label>
            <textarea
              name="jobDescription"
              placeholder="Enter job description..."
              rows={10}
              onChange={(e) => { setjobDescription(e.target.value) }}
              className="h-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/40 transition resize-none"
            />
          </div>

          {/* RIGHT - Resume + Self Description */}
          <div className="flex flex-col justify-between">

            <div className="space-y-5">

              {/* Resume Upload */}
              <div className="flex flex-col">
                <label className="text-gray-300 mb-2 text-sm">
                  Upload Resume (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  ref={resumeInputRef}
                  className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white file:text-black hover:file:bg-gray-200 transition"
                />
              </div>

              {/* Self Description */}
              <div className="flex flex-col">
                <label className="text-gray-300 mb-2 text-sm">
                  Self Description
                </label>
                <textarea
                  name="selfDescription"
                  placeholder="Describe yourself..."
                  rows={5}
                  onChange={(e) => { setselfDescription(e.target.value) }}
                  className="px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/40 transition resize-none"
                />
              </div>

            </div>

            {/* Button Bottom Right */}
            <div className="flex justify-end mt-6">
              <button
                className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition"
                onClick={handleGenerateReport}
              >
                Generate Report
              </button>
            </div>

          </div>

        </div>

        {/* recent reports */}
        {reports?.length > 0 && (
          <h2 className="text-2xl font-semibold text-white mt-10 mb-4">
            Recent Interview Reports
          </h2>
        )}

        <div className='space-y-4'>
          {reports?.map((report) => (
            <div
              key={report._id}
              className="p-4 rounded-lg bg-white/10 text-white cursor-pointer hover:bg-white/20 transition"
              onClick={() => navigate(`/interview/${report._id}`)}
            >
              <h3 className="text-md font-semibold">
                {report.title}
              </h3>

            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default Home