import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { useToast } from '../../shared/toast.context'
import { generateInterviewReport, getInterviewReport, getSessionById } from '../services/interview.api'
import Spinner from '../../shared/Spinner'

const NAV_ITEMS = [
  { id: 'technical', label: 'Technical' },
  { id: 'behavioral', label: 'Behavioral' },
  { id: 'roadmap', label: 'Roadmap' },
]

const Interview = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { handleLogout, authenticating } = useAuth()
  const { addToast } = useToast()

  const [activeNav, setActiveNav] = useState('technical')
  const [report, setReport] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    const fetchData = async () => {
      try {
        const sessionData = await getSessionById(sessionId)
        if (!ignore) {
          setSession(sessionData.session)
        }

        try {
          const reportData = await getInterviewReport(sessionId)
          if (!ignore) {
            setReport(reportData.interviewReport)
          }
        } catch (err) {
          if (err.response?.status !== 404) throw err
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load data")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [sessionId])

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const data = await generateInterviewReport(sessionId)
      setReport(data.interviewReport)
      addToast({ message: "Interview report generated!", type: "success" })
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate interview report")
    } finally {
      setGenerating(false)
    }
  }

  const onLogout = async () => {
    const result = await handleLogout()
    if (!result.success) {
      addToast({ message: result.error || "Logout failed", type: "error" })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="animate-fade-in-up flex flex-col items-center gap-4">
          <Spinner size="xl" className="text-purple-400" />
          <p className="text-gray-400 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !report) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="animate-fade-in-up max-w-md w-full p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-500/15 border border-red-400/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleGenerate} className="px-5 py-2.5 rounded-xl font-medium text-white bg-purple-500/20 border border-purple-400/30 hover:bg-purple-500/30 transition-all">Retry</button>
            <button onClick={() => navigate(`/dashboard/${sessionId}`)} className="px-5 py-2.5 rounded-xl font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">Back</button>
          </div>
        </div>
      </div>
    )
  }

  // No report yet — show generate button
  if (!report) {
    return (
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="animate-fade-in-up max-w-lg w-full p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-center">
          <span className="text-5xl mb-4 block">🎯</span>
          <h2 className="text-2xl font-semibold text-white mb-3">Interview Approach</h2>
          <p className="text-gray-400 text-sm mb-8">
            AI will generate technical & behavioral interview questions with answers, intentions, and a 7-day preparation roadmap tailored to your resume and job description.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-8 py-3 rounded-xl font-semibold text-black bg-linear-to-r from-purple-400 to-blue-400 
            hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2 mx-auto
            disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Spinner size="sm" className="text-black" />
                <span>Generating...</span>
              </>
            ) : "Generate Questions"}
          </button>
        </div>

        {generating && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="animate-fade-in-up flex flex-col items-center gap-5">
              <Spinner size="xl" className="text-purple-400" />
              <p className="text-white text-lg font-medium">Generating interview questions...</p>
              <p className="text-gray-400 text-sm">This may take a moment</p>
            </div>
          </div>
        )}
      </main>
    )
  }

  // Report exists — show Q&A
  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between">
        <button onClick={() => navigate(`/dashboard/${sessionId}`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all text-sm text-gray-200"
        >
          <span>←</span> <span>Dashboard</span>
        </button>
        <h1 className="text-2xl font-semibold">
          <span className="bg-linear-to-r from-purple-400 via-blue-400 to-indigo-400 text-transparent bg-clip-text">InterviewMaster</span>
        </h1>
        <button onClick={onLogout} disabled={authenticating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 transition-all text-sm text-red-300 disabled:opacity-60"
        >Logout</button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 animate-fade-in-up">
        {/* Left Nav */}
        <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
          <p className="text-gray-500 text-lg text-center uppercase mb-4 tracking-wider">Menu</p>
          <div className="space-y-2">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => setActiveNav(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200
                ${activeNav === item.id
                    ? 'bg-linear-to-r from-purple-500/20 to-blue-500/20 border border-white/10 text-white'
                    : 'hover:bg-white/10 text-gray-400'}`}
              >{item.label}</button>
            ))}
          </div>
        </div>

        {/* Center Content */}
        <div className="col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 tracking-wide">
            {activeNav === 'technical' && 'Technical Questions'}
            {activeNav === 'behavioral' && 'Behavioral Questions'}
            {activeNav === 'roadmap' && 'Preparation Roadmap'}
          </h2>

          <div className="space-y-5">
            {activeNav === 'technical' && (report.technicalQuestions || []).map((q, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <p className="font-medium mb-2">Q{i + 1}. {q.question}</p>
                <p className="text-sm text-blue-300 mb-1"><span className="text-yellow-400">Intention:</span> {q.intention}</p>
                <p className="text-sm text-gray-300"><span className="text-yellow-400">Answer:</span> {q.answer}</p>
              </div>
            ))}

            {activeNav === 'behavioral' && (report.behavioralQuestions || []).map((q, i) => (
              <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <p className="font-medium mb-2">Q{i + 1}. {q.question}</p>
                <p className="text-sm text-blue-300 mb-1"><span className="text-yellow-400">Intention:</span> {q.intention}</p>
                <p className="text-sm text-gray-300"><span className="text-yellow-400">Answer:</span> {q.answer}</p>
              </div>
            ))}

            {activeNav === 'roadmap' && (report.preparationPlan || []).map((day, i) => {
              const tasksSource = Array.isArray(day.tasks) ? day.tasks : []
              const tasks = Array.isArray(tasksSource[0]) ? tasksSource[0] : tasksSource
              return (
                <div key={i} className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-blue-500 text-white text-sm font-semibold">{day.day}</div>
                      <p className="font-semibold text-white">Day {day.day}</p>
                    </div>
                    <span className="text-xs text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/20">{day.focus}</span>
                  </div>
                  <div className="relative ml-4 pl-6 border-l border-white/10 space-y-4">
                    {tasks.map((t, idx) => (
                      <div key={idx}><p className="text-gray-300 text-sm leading-relaxed">{t}</p></div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-3 space-y-6">
          {session && (
            <>
              <div className="bg-linear-to-br from-yellow-400/20 to-yellow-200/10 border border-yellow-400/20 backdrop-blur-xl rounded-2xl p-6 text-center shadow-lg">
                <p className="text-gray-400 text-sm mb-2">Match Score</p>
                <h1 className="text-5xl font-bold text-yellow-300">{session.matchScore}%</h1>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                <p className="text-gray-400 text-sm mb-4">Skill Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {(session.skillGaps || []).map((gap, i) => (
                    <span key={i} className={`px-3 py-1 rounded-full text-xs font-medium
                      ${gap.severity === 'high' ? 'bg-red-500/20 text-red-400 border border-red-400/20' : ''}
                      ${gap.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/20' : ''}
                      ${gap.severity === 'low' ? 'bg-green-500/20 text-green-400 border border-green-400/20' : ''}
                    `}>{gap.skill}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default Interview
