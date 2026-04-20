import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useToast } from '../../../contexts/toast.context'
import { generateInterviewReport, getInterviewReport, getSessionById } from '../services/interview.api'
import Spinner from '../../../components/Spinner'
import PageLoader from '../../../components/PageLoader'
import SkillGapBadge from '../../sessions/components/SkillGapBadge'

const NAV_ITEMS = [
  { id: 'technical', label: 'Technical', icon: '💻' },
  { id: 'behavioral', label: 'Behavioral', icon: '🗣️' },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
]

const Interview = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
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

  if (loading) {
    return <PageLoader message="Loading..." />
  }

  if (error && !report) {
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
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleGenerate}
              className="gradient-button px-5 py-2.5 text-sm">Retry</button>
            <button onClick={() => navigate(`/app/session/${sessionId}`)}
              className="px-5 py-2.5 rounded-xl text-sm transition-all hover:bg-white/10"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-fade-in-up max-w-lg w-full p-10 glass-card text-center">
          <span className="text-5xl mb-4 block">🎯</span>
          <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Interview Approach</h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            AI will generate technical & behavioral interview questions with answers, intentions, and a 7-day preparation roadmap tailored to your resume and job description.
          </p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="gradient-button px-8 py-3 text-sm flex items-center gap-2 mx-auto"
          >
            {generating ? (
              <>
                <Spinner size="sm" className="text-white" />
                <span>Generating...</span>
              </>
            ) : "Generate Questions"}
          </button>
        </div>

        {generating && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(11,15,26,0.8)', backdropFilter: 'blur(8px)' }}>
            <div className="animate-fade-in-up flex flex-col items-center gap-5">
              <Spinner size="xl" className="text-violet-400" />
              <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Generating interview questions...</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This may take a moment</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(`/app/session/${sessionId}`)}
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Interview Approach</h1>
      </div>

      <div className="flex gap-1 p-1 rounded-xl mb-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveNav(item.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: activeNav === item.id ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))' : 'transparent',
              color: activeNav === item.id ? 'var(--text-primary)' : 'var(--text-muted)',
              border: activeNav === item.id ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
            }}>
            <span>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-4 stagger-children">
          {activeNav === 'technical' && (report.technicalQuestions || []).map((q, i) => (
            <div key={i} className="glass-card p-6 glass-card-hover">
              <p className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2"
                  style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--accent-primary-light)' }}>{i + 1}</span>
                {q.question}
              </p>
              <div className="ml-8 space-y-2">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--accent-warning)' }}>Intention: </span>{q.intention}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--accent-success)' }}>Answer: </span>{q.answer}
                </p>
              </div>
            </div>
          ))}

          {activeNav === 'behavioral' && (report.behavioralQuestions || []).map((q, i) => (
            <div key={i} className="glass-card p-6 glass-card-hover">
              <p className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2"
                  style={{ background: 'rgba(6,182,212,0.2)', color: 'var(--accent-secondary)' }}>{i + 1}</span>
                {q.question}
              </p>
              <div className="ml-8 space-y-2">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--accent-warning)' }}>Intention: </span>{q.intention}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--accent-success)' }}>Answer: </span>{q.answer}
                </p>
              </div>
            </div>
          ))}

          {activeNav === 'roadmap' && (report.preparationPlan || []).map((day, i) => {
            const tasksSource = Array.isArray(day.tasks) ? day.tasks : []
            const tasks = Array.isArray(tasksSource[0]) ? tasksSource[0] : tasksSource
            return (
              <div key={i} className="glass-card p-6 glass-card-hover">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>{day.day}</div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Day {day.day}</p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full"
                    style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--accent-secondary)' }}>
                    {day.focus}
                  </span>
                </div>
                <div className="ml-12 pl-4 space-y-3" style={{ borderLeft: '2px solid var(--border)' }}>
                  {tasks.map((t, idx) => (
                    <p key={idx} className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{t}</p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {session && (
          <div className="space-y-4">
            <div className="glass-card p-5 text-center">
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Match Score</p>
              <h2 className="text-4xl font-bold" style={{ color: 'var(--accent-warning)' }}>{session.matchScore}%</h2>
            </div>
            <div className="glass-card p-5">
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Skill Gaps</p>
              <div className="flex flex-wrap gap-1.5">
                {(session.skillGaps || []).map((gap, i) => (
                  <SkillGapBadge key={i} skill={gap.skill} severity={gap.severity} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Interview
