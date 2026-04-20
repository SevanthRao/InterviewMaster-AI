import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useToast } from '../../../contexts/toast.context'
import { getSessionById, updateSession, generateResumePDF } from '../services/session.api'
import Spinner from '../../../components/Spinner'
import PageLoader from '../../../components/PageLoader'
import FeatureCard from '../components/FeatureCard'
import SkillGapBadge from '../components/SkillGapBadge'
import MatchScoreGauge from '../components/MatchScoreGauge'
import HistoryTimeline from '../components/HistoryTimeline'

const FEATURES = [
  {
    id: 'interview',
    icon: '🎯',
    title: 'Interview Approach',
    description: 'AI-generated technical & behavioral questions with answers and a 7-day roadmap.',
    color: '#7C3AED',
    path: 'interview'
  },
  {
    id: 'aptitude',
    icon: '🧠',
    title: 'Aptitude Test',
    description: 'Timed MCQ test covering logical reasoning, quantitative, and verbal ability.',
    color: '#06B6D4',
    path: 'aptitude'
  },
  {
    id: 'technical',
    icon: '💻',
    title: 'Technical Test',
    description: '5 DSA and programming questions with short answers.',
    color: '#10B981',
    path: 'technical'
  },
  {
    id: 'resume',
    icon: '📄',
    title: 'AI Resume',
    description: 'Download a professionally tailored, ATS-friendly PDF resume.',
    color: '#F59E0B',
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

const SessionDashboard = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
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

    navigate(`/app/session/${sessionId}/${feature.path}`)
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
    return <PageLoader message="Loading dashboard..." />
  }

  if (error || !session || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-fade-in-up max-w-md w-full p-8 glass-card text-center">
          <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <svg className="w-8 h-8" style={{ color: '#F87171' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Failed to Load Session</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error || "Session data is unavailable."}</p>
          <button onClick={() => navigate("/app")}
            className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-white/10"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}>
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Back Button + Session Title */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate("/app")}
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{session.title}</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Created {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Top Row: Score + Skill Gaps */}
      <div className="grid md:grid-cols-[200px_1fr] gap-6 mb-8 animate-fade-in-up">
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <MatchScoreGauge score={session.matchScore} />
          <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>Resume Match</p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Skill Gaps</h3>
          <div className="flex flex-wrap gap-2">
            {(session.skillGaps || []).length > 0 ? session.skillGaps.map((gap, index) => (
              <SkillGapBadge key={`${gap.skill}-${index}`} skill={gap.skill} severity={gap.severity} />
            )) : (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No skill gaps detected.</p>
            )}
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI Tools</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Generate from your saved session</p>
          </div>
          {isDirty && (
            <p className="text-xs font-medium" style={{ color: 'var(--accent-warning)' }}>
              Save your edits before generating.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4 stagger-children">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
              onClick={() => handleFeatureClick(feature)}
              loading={feature.id === 'resume' && pdfLoading}
              disabled={saving}
            />
          ))}
        </div>
      </div>

      {/* Bottom Row: History + Editable Data */}
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 animate-fade-in-up">
        {/* History */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Session History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(6,182,212,0.1)',
                border: '1px solid rgba(6,182,212,0.2)',
                color: 'var(--accent-secondary)',
              }}>
              {(session.history || []).length} items
            </span>
          </div>
          <HistoryTimeline history={session.history} />
        </div>

        {/* Editable Data */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Editable Session Data</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Saving re-analyzes the session and clears generated materials.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || saving}
              className="gradient-button px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Self Description</span>
              <textarea
                rows={4}
                value={form.selfDescription}
                onChange={(e) => handleFieldChange("selfDescription", e.target.value)}
                className="textarea-field"
              />
            </label>

            <label className="block">
              <span className="text-sm mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Job Description</span>
              <textarea
                rows={5}
                value={form.jobDescription}
                onChange={(e) => handleFieldChange("jobDescription", e.target.value)}
                className="textarea-field"
              />
            </label>

            <label className="block">
              <span className="text-sm mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Resume Text</span>
              <textarea
                rows={8}
                value={form.resume}
                onChange={(e) => handleFieldChange("resume", e.target.value)}
                className="textarea-field"
              />
            </label>
          </div>
        </div>
      </div>

      {pdfLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'rgba(11,15,26,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="animate-fade-in-up flex flex-col items-center gap-5">
            <Spinner size="xl" className="text-cyan-400" />
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Generating your resume...</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This may take a moment</p>
          </div>
        </div>
      )}
    </>
  )
}

export default SessionDashboard
