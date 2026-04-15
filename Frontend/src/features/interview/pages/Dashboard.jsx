import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'
import { useToast } from '../../shared/toast.context'
import { generateResumePDF, getSessionById, updateSession } from '../services/interview.api'
import Spinner from '../../shared/Spinner'

const FEATURES = [
  {
    id: 'interview',
    icon: '🎯',
    title: 'Interview Approach',
    description: 'Get AI-generated technical and behavioral questions with answers and a preparation roadmap.',
    color: 'from-purple-500/20 to-blue-500/20',
    borderColor: 'border-purple-400/20',
    path: 'interview'
  },
  {
    id: 'aptitude',
    icon: '🧠',
    title: 'Aptitude Test',
    description: 'Take a timed MCQ test covering logical reasoning, quantitative aptitude, and verbal ability.',
    color: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-400/20',
    path: 'aptitude'
  },
  {
    id: 'technical',
    icon: '💻',
    title: 'Technical Test',
    description: '5 basic-level DSA and programming questions with short answers.',
    color: 'from-orange-500/20 to-yellow-500/20',
    borderColor: 'border-orange-400/20',
    path: 'technical'
  },
  {
    id: 'resume',
    icon: '📄',
    title: 'AI Resume',
    description: 'Download a professionally tailored, ATS-friendly resume generated from the saved session.',
    color: 'from-blue-500/20 to-indigo-500/20',
    borderColor: 'border-blue-400/20',
    path: null
  }
]

const createFormState = (session) => ({
  selfDescription: session?.selfDescription || "",
  jobDescription: session?.jobDescription || "",
  resume: session?.resume || ""
})

const buildSessionPayload = (source) => ({
  selfDescription: source.selfDescription.trim(),
  jobDescription: source.jobDescription.trim(),
  resume: source.resume.trim()
})

const Dashboard = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { handleLogout, authenticating } = useAuth()
  const { addToast } = useToast()

  const [session, setSession] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    let ignore = false

    const fetchSession = async () => {
      try {
        const data = await getSessionById(sessionId)

        if (!ignore) {
          setSession(data.session)
          setForm(createFormState(data.session))
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || "Failed to load session")
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchSession()

    return () => {
      ignore = true
    }
  }, [sessionId])

  const isDirty = useMemo(() => {
    if (!session || !form) {
      return false
    }

    return JSON.stringify(buildSessionPayload(form)) !== JSON.stringify(buildSessionPayload(createFormState(session)))
  }, [form, session])

  const onLogout = async () => {
    const result = await handleLogout()

    if (!result.success) {
      addToast({ message: result.error || "Logout failed", type: "error" })
    }
  }

  const handleFeatureClick = async (feature) => {
    if (feature.id === 'resume') {
      setPdfLoading(true)

      try {
        const response = await generateResumePDF(sessionId)
        const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", `resume_${sessionId}.pdf`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        addToast({ message: "Resume PDF downloaded.", type: "success" })
      } catch (err) {
        addToast({ message: err.response?.data?.message || "Failed to generate resume", type: "error" })
      } finally {
        setPdfLoading(false)
      }

      return
    }

    navigate(`/session/${sessionId}/${feature.path}`)
  }

  const handleFieldChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }))
  }

  const handleSave = async () => {
    const payload = buildSessionPayload(form)

    if (!payload.resume || !payload.selfDescription || !payload.jobDescription) {
      addToast({ message: "Resume, self description, and job description are required.", type: "error" })
      return
    }

    setSaving(true)

    try {
      const data = await updateSession(sessionId, payload)
      setSession(data.session)
      setForm(createFormState(data.session))
      addToast({
        message: "Session saved and re-analyzed. Existing generated materials were cleared, regenerate them from the dashboard.",
        type: "success",
        duration: 5000
      })
    } catch (err) {
      addToast({ message: err.response?.data?.message || "Failed to save session", type: "error" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="animate-fade-in-up flex flex-col items-center gap-4">
          <Spinner size="xl" className="text-purple-400" />
          <p className="text-gray-400 text-sm tracking-wide animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error || !session || !form) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="animate-fade-in-up max-w-md w-full p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-500/15 border border-red-400/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Session</h2>
          <p className="text-gray-400 text-sm mb-6">{error || "Session data is unavailable."}</p>
          <button onClick={() => navigate("/")} className="px-5 py-2.5 rounded-xl font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all duration-200 text-sm text-gray-200"
        >
          <span>←</span> <span>Home</span>
        </button>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">
          <span className="bg-linear-to-r from-purple-400 via-blue-400 to-indigo-400 text-transparent bg-clip-text">
            InterviewMaster
          </span>
        </h1>

        <button
          onClick={onLogout}
          disabled={authenticating}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 transition-all text-sm text-red-300 disabled:opacity-60"
        >
          Logout
        </button>
      </div>
      <div className="max-w-6xl mx-auto animate-fade-in-up space-y-8 mt-10 mb-10">
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Derived Summary</p>
            <h3 className="mb-4 text-lg font-semibold text-white">Current Analysis</h3>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-sm text-gray-400">Match Score</p>
                <p className="text-2xl font-bold text-yellow-300">{session.matchScore}%</p>
              </div>
              <div>
                <p className="mb-1 text-lg text-gray-400">Profile Title</p>
                <p className="text-white">{session.title}</p>
              </div>

              <div>
                <p className="mb-2 text-lg text-gray-400">Skill Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {(session.skillGaps || []).length > 0 ? session.skillGaps.map((gap, index) => (
                    <span
                      key={`${gap.skill}-${index}`}
                      className={`rounded-full px-3 py-1 text-xs font-medium
                        ${gap.severity === 'high' ? 'border border-red-400/20 bg-red-500/20 text-red-300' : ''}
                        ${gap.severity === 'medium' ? 'border border-yellow-400/20 bg-yellow-500/20 text-yellow-300' : ''}
                        ${gap.severity === 'low' ? 'border border-green-400/20 bg-green-500/20 text-green-300' : ''}`}
                    >
                      {gap.skill}
                    </span>
                  )) : (
                    <p className="text-sm text-gray-500">No current skill gaps detected.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">AI Tools</p>
                <h3 className="text-xl font-semibold text-white">Generate From Current Saved Session</h3>
              </div>
              {isDirty && (
                <p className="text-sm text-yellow-300">
                  Save your edits before generating new materials.
                </p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {FEATURES.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => handleFeatureClick(feature)}
                  disabled={(feature.id === 'resume' && pdfLoading) || saving}
                  className={`group rounded-2xl border bg-linear-to-br ${feature.color} ${feature.borderColor}
                    p-6 text-left shadow-lg backdrop-blur-xl transition-all duration-200 hover:scale-[1.02]
                    active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{feature.icon}</span>
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-white group-hover:text-white/90">
                        {feature.id === 'resume' && pdfLoading ? (
                          <span className="flex items-center gap-2">
                            <Spinner size="sm" className="text-white" />
                            Generating...
                          </span>
                        ) : feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-400">{feature.description}</p>
                    </div>
                    <span className="mt-1 text-xl text-gray-600 transition-colors group-hover:text-gray-400">→</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </section>
      </div>



      <div className="max-w-6xl mx-auto animate-fade-in-up space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Recent History</p>
                <h3 className="text-lg font-semibold text-white">{session.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Created {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                {(session.history || []).length} items
              </span>
            </div>

            <div className="space-y-3">
              {(session.history || []).length > 0 ? session.history.map((entry, index) => (
                <div key={`${entry.type}-${entry.createdAt}-${index}`} className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{entry.label}</p>
                      {entry.detail && <p className="mt-1 text-sm text-gray-400">{entry.detail}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-gray-500">
                      {new Date(entry.createdAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500">History will appear here after analysis and generation actions.</p>
              )}
            </div>
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">Save Flow</p>
                <h3 className="text-lg font-semibold text-white">Editable Session Data</h3>
                <p className="mt-2 max-w-md text-sm text-gray-400">
                  Edit only self description, job description, and resume text. Saving re-analyzes the session and clears old generated materials.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-emerald-400 to-teal-300 px-5 py-2.5 font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Spinner size="sm" className="text-black" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">Self Description</span>
                <textarea
                  rows={5}
                  value={form.selfDescription}
                  onChange={(e) => handleFieldChange("selfDescription", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">Job Description</span>
                <textarea
                  rows={7}
                  value={form.jobDescription}
                  onChange={(e) => handleFieldChange("jobDescription", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-gray-400">Resume Text</span>
                <textarea
                  rows={12}
                  value={form.resume}
                  onChange={(e) => handleFieldChange("resume", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
                />
              </label>
            </div>
          </section>
        </section>
      </div>

      {pdfLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="animate-fade-in-up flex flex-col items-center gap-5">
            <Spinner size="xl" className="text-blue-400" />
            <p className="text-lg font-medium text-white">Generating your resume...</p>
            <p className="text-sm text-gray-400">This may take a moment</p>
          </div>
        </div>
      )}
    </main>
  )
}

export default Dashboard
