import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { useToast } from '../../shared/toast.context'
import { createSession, getAllSessions } from '../services/interview.api'
import Spinner from '../../shared/Spinner'

const Home = () => {
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [resumeFile, setResumeFile] = useState(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const { handleLogout, authenticating } = useAuth()
  const { addToast } = useToast()

  const navigate = useNavigate()

  const MAX_FILE_SIZE = 3 * 1024 * 1024

  useEffect(() => {
    let ignore = false

    const fetchSessions = async () => {
      try {
        const data = await getAllSessions()
        if (!ignore) {
          setSessions(data.sessions || [])
        }
      } catch {
        if (!ignore) {
          addToast({ message: "Past sessions could not be loaded right now.", type: "warning" })
        }
      } finally {
        if (!ignore) {
          setLoadingSessions(false)
        }
      }
    }

    fetchSessions()

    return () => {
      ignore = true
    }
  }, [addToast])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 3MB.")
      setResumeFile(null)
      e.target.value = ""
      return
    }
    setResumeFile(file)
    setError("")
  }

  const handleAnalyzeResume = async () => {
    setError("")
    if (!jobDescription.trim()) {
      setError("Please provide a Job Description.")
      return
    }
    if (!resumeFile) {
      setError("Please upload your Resume as PDF.")
      return
    }
    if (!selfDescription.trim()) {
      setError("Please provide a Self Description.")
      return
    }

    setSubmitting(true)
    try {
      const data = await createSession({ jobDescription, selfDescription, resumeFile })
      addToast({ message: "Resume analyzed successfully!", type: "success" })
      navigate(`/dashboard/${data.session._id}`)
    } catch (err) {
      const message = err.response?.data?.message || "Failed to analyze resume. Please try again."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const onLogout = async () => {
    const result = await handleLogout()
    if (!result.success) {
      addToast({ message: result.error || "Logout failed", type: "error" })
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden px-4">

      {/* Background Glow */}
      <div className="absolute w-125 h-125 bg-purple-500/20 blur-[120px] rounded-full -top-25 -left-25" />
      <div className="absolute w-125 h-125 bg-blue-500/20 blur-[120px] rounded-full -bottom-25 -right-25" />

      {/* Container */}
      <div className="relative w-full max-w-5xl px-8 py-10 rounded-3xl 
        bg-white/5 backdrop-blur-xl border border-white/10 
        shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-fade-in-up">

        <div className="max-w-7xl mx-auto mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onLogout}
            disabled={authenticating}
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

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-400/30 flex items-center gap-3 animate-fade-in-up">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 text-sm font-medium flex-1">{error}</p>
            <button onClick={() => setError("")} className="text-red-400/60 hover:text-red-300 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT */}
          <div className="flex flex-col gap-3">
            <label className="text-gray-400 text-sm">Job Description</label>
            <textarea
              placeholder="Paste job description..."
              rows={12}
              disabled={submitting}
              onChange={(e) => setJobDescription(e.target.value)}
              className="px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder-gray-500 outline-none resize-none
              focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              {/* Upload */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-sm">Upload Resume</label>
                <input
                  type="file"
                  accept=".pdf"
                  disabled={submitting}
                  onChange={handleFileChange}
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400
                  file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 
                  file:bg-white file:text-black hover:file:bg-gray-200
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-gray-600 text-xs ml-1">PDF only, max 3MB</p>
              </div>

              {/* Self Desc */}
              <div className="flex flex-col gap-3">
                <label className="text-gray-400 text-sm">Self Description</label>
                <textarea
                  placeholder="Tell something about yourself..."
                  rows={6}
                  disabled={submitting}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  className="px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white 
                  placeholder-gray-500 outline-none resize-none
                  focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Button */}
            <div className="flex flex-col items-end mt-8 gap-3">
              <button
                className="px-6 py-2.5 rounded-xl font-semibold text-black 
                bg-linear-to-r from-yellow-400 to-yellow-200 
                hover:opacity-90 active:scale-[0.97] transition-all duration-200 
                shadow-lg shadow-yellow-500/20 flex items-center gap-2
                disabled:opacity-70 disabled:cursor-not-allowed"
                onClick={handleAnalyzeResume}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" className="text-black" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  "Analyze Resume"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Past Sessions */}
        {loadingSessions ? (
          <div className="mt-12 flex justify-center">
            <Spinner size="md" className="text-gray-500" />
          </div>
        ) : sessions.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Past Sessions</h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="p-5 rounded-xl bg-white/5 border border-white/10 text-white 
                  cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.99]
                  flex items-center justify-between"
                  onClick={() => navigate(`/dashboard/${session._id}`)}
                >
                  <div>
                    <h3 className="text-md font-medium">{session.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-300 font-bold text-lg">{session.matchScore}%</span>
                    <span className="text-gray-500">→</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Analyzing Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="animate-fade-in-up flex flex-col items-center gap-5">
            <Spinner size="xl" className="text-yellow-400" />
            <p className="text-white text-lg font-medium tracking-wide">Analyzing your resume...</p>
            <p className="text-gray-400 text-sm">This may take a moment</p>
          </div>
        </div>
      )}
    </main>
  )
}

export default Home
