import React, { useState, useRef } from 'react'
import { useInterview } from '../hooks/useInterview';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hooks/useAuth'


const Home = () => {

  const { loading, handlegenerateInterviewReport, reports } = useInterview()
  const [jobDescription, setjobDescription] = useState("")
  const [selfDescription, setselfDescription] = useState("")
  const resumeInputRef = useRef()
  const { handleLogout, loading: authLoading } = useAuth()

  const navigate = useNavigate()

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current.files[0]
    const data = await handlegenerateInterviewReport({ jobDescription, selfDescription, resumeFile })
    navigate(`/interview/${data._id}`)
  }

  if (loading) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-black'>
        <h1 className='text-3xl font-semibold text-white animate-pulse tracking-wide'>
          Generating your report...
        </h1>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden px-4">

      {/* Background Glow */}
      <div className="absolute w-125 h-125 bg-purple-500/20 blur-[120px] rounded-full -top-25 -left-25" />
      <div className="absolute w-125 h-125 bg-blue-500/20 blur-[120px] rounded-full -bottom-25 -right-25" />

      {/* Container */}
      <div className="relative w-full max-w-5xl px-8 py-10 rounded-3xl 
        bg-white/5 backdrop-blur-xl border border-white/10 
        shadow-[0_10px_40px_rgba(0,0,0,0.6)]">

        <div className="max-w-7xl mx-auto mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={handleLogout}
            disabled={authLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 text-sm text-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>Logout</span>
          </button>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-semibold mb-10 text-center tracking-wide">
          <span className="bg-linear-to-r from-purple-400 via-blue-400 to-indigo-400 text-transparent bg-clip-text">
            InterviewMaster
          </span>
          <span className="block text-gray-400 text-base mt-2">
            Your AI Interview Assistant
          </span>
        </h1>
        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="flex flex-col gap-3">
            <label className="text-gray-400 text-sm">
              Job Description
            </label>
            <textarea
              name="jobDescription"
              placeholder="Paste job description..."
              rows={12}
              onChange={(e) => setjobDescription(e.target.value)}
              className="px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder-gray-500 outline-none resize-none
              focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
            />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-between">

            <div className="space-y-6">

              {/* Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">
                  Upload Resume
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  ref={resumeInputRef}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400
                  file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                  file:bg-white file:text-black hover:file:bg-gray-200
                  transition-all"
                />
              </div>

              {/* Self Desc */}
              <div className="flex flex-col gap-3">
                <label className="text-gray-400 text-sm">
                  Self Description
                </label>
                <textarea
                  name="selfDescription"
                  placeholder="Tell something about yourself..."
                  rows={6}
                  onChange={(e) => setselfDescription(e.target.value)}
                  className="px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white 
                  placeholder-gray-500 outline-none resize-none
                  focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
                />
              </div>

            </div>

            {/* Button */}
            <div className="flex justify-end mt-8">
              <button
                className="px-6 py-2.5 rounded-xl font-semibold text-black 
                bg-linear-to-r from-yellow-400 to-yellow-200 
                hover:opacity-90 active:scale-[0.97] transition-all duration-200 
                shadow-lg shadow-yellow-500/20"
                onClick={handleGenerateReport}
              >
                Generate Report
              </button>
            </div>

          </div>

        </div>

        {/* Reports */}
        {reports?.length > 0 && (
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">
            Recent Reports
          </h2>
        )}

        <div className='space-y-4'>
          {reports?.map((report) => (
            <div
              key={report._id}
              className="p-5 rounded-xl bg-white/5 border border-white/10 text-white 
              cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
              onClick={() => navigate(`/interview/${report._id}`)}
            >
              <h3 className="text-md font-medium">
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