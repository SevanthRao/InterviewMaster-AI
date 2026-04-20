import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useToast } from '../../../contexts/toast.context'
import { generateAptitudeTest, submitAptitudeTest } from '../services/aptitude.api'
import Spinner from '../../../components/Spinner'

const TIME_OPTIONS = [10, 15, 20, 30]
const COUNT_OPTIONS = [10, 15, 20]

const AptitudeTest = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [phase, setPhase] = useState('config')
  const [timeLimit, setTimeLimit] = useState(15)
  const [questionCount, setQuestionCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [testId, setTestId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef(null)

  const [result, setResult] = useState(null)

  const handleSubmit = useCallback(async () => {
    if (submitting) return
    if (!testId) {
      addToast({ message: "Test session is missing. Please restart the test.", type: "error" })
      return
    }

    setSubmitting(true)
    clearTimeout(timerRef.current)

    try {
      const data = await submitAptitudeTest(testId, answers)
      setResult(data.aptitudeTest)
      setPhase('results')
      addToast({ message: "Test submitted!", type: "success" })
    } catch (err) {
      addToast({ message: err.response?.data?.message || "Failed to submit test", type: "error" })
    } finally {
      setSubmitting(false)
    }
  }, [testId, answers, submitting, addToast])

  useEffect(() => {
    if (phase !== 'test' || timeLeft <= 0 || submitting) return

    if (timeLeft === 1) {
      setTimeLeft(0)
      handleSubmit()
      return
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearTimeout(timerRef.current)
  }, [phase, timeLeft, submitting, handleSubmit])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const data = await generateAptitudeTest(sessionId, { timeLimit, questionCount })
      setTestId(data.aptitudeTest._id)
      setQuestions(data.aptitudeTest.questions)
      setAnswers(new Array(data.aptitudeTest.questions.length).fill(-1))
      setTimeLeft(timeLimit * 60)
      setPhase('test')
    } catch (err) {
      addToast({ message: err.response?.data?.message || "Failed to generate test", type: "error" })
    } finally {
      setGenerating(false)
    }
  }

  const handleAnswerSelect = (optionIndex) => {
    setAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[currentQ] = optionIndex
      return newAnswers
    })
  }

  // ===== CONFIG PHASE =====
  if (phase === 'config') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'var(--bg-primary)' }}>
        <div className="animate-fade-in-up max-w-lg w-full p-10 glass-card">
          <button onClick={() => navigate(`/app/session/${sessionId}`)}
            className="inline-flex items-center gap-2 mb-6 text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}>
            <span>←</span> Back to Dashboard
          </button>

          <div className="text-center mb-8">
            <span className="text-4xl mb-3 block">🧠</span>
            <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Aptitude Test</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Configure your test settings below</p>
          </div>

          <div className="mb-6">
            <label className="text-sm mb-3 block" style={{ color: 'var(--text-secondary)' }}>Time Limit</label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_OPTIONS.map(t => (
                <button key={t} onClick={() => setTimeLimit(t)}
                  className="py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: timeLimit === t ? 'rgba(6,182,212,0.15)' : 'var(--bg-elevated)',
                    border: timeLimit === t ? '1px solid rgba(6,182,212,0.3)' : '1px solid var(--border)',
                    color: timeLimit === t ? 'var(--accent-secondary)' : 'var(--text-muted)',
                  }}>{t} min</button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-sm mb-3 block" style={{ color: 'var(--text-secondary)' }}>Number of Questions</label>
            <div className="grid grid-cols-3 gap-2">
              {COUNT_OPTIONS.map(c => (
                <button key={c} onClick={() => setQuestionCount(c)}
                  className="py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: questionCount === c ? 'rgba(6,182,212,0.15)' : 'var(--bg-elevated)',
                    border: questionCount === c ? '1px solid rgba(6,182,212,0.3)' : '1px solid var(--border)',
                    color: questionCount === c ? 'var(--accent-secondary)' : 'var(--text-muted)',
                  }}>{c} Qs</button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating}
            className="gradient-button w-full py-3 text-sm flex items-center justify-center gap-2">
            {generating ? (
              <><Spinner size="sm" className="text-white" /><span>Generating...</span></>
            ) : "Start Test"}
          </button>
        </div>

        {generating && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(11,15,26,0.8)', backdropFilter: 'blur(8px)' }}>
            <div className="animate-fade-in-up flex flex-col items-center gap-5">
              <Spinner size="xl" className="text-cyan-400" />
              <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Generating your test...</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This may take a moment</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ===== TEST PHASE =====
  if (phase === 'test') {
    const q = questions[currentQ]
    const answered = answers.filter(a => a !== -1).length
    const isLowTime = timeLeft < 60

    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {/* Top Bar */}
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            <span style={{ color: 'var(--accent-secondary)' }}>Aptitude Test</span>
            <span className="text-sm ml-3" style={{ color: 'var(--text-muted)' }}>
              Question {currentQ + 1} of {questions.length}
            </span>
          </h2>
          <div className={`px-4 py-2 rounded-xl font-mono text-lg font-bold ${isLowTime ? 'animate-pulse' : ''}`}
            style={{
              background: isLowTime ? 'rgba(239,68,68,0.15)' : 'var(--bg-elevated)',
              border: `1px solid ${isLowTime ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
              color: isLowTime ? '#F87171' : 'var(--text-primary)',
            }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-5xl mx-auto mb-6">
          <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'var(--accent-secondary)' }} />
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-12 gap-6">
          {/* Question Navigator */}
          <div className="col-span-3 glass-card p-4">
            <p className="text-sm mb-3 text-center" style={{ color: 'var(--text-muted)' }}>Questions</p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className="w-9 h-9 rounded-lg text-xs font-medium transition-all flex items-center justify-center"
                  style={{
                    background: currentQ === i ? 'rgba(6,182,212,0.2)' :
                      answers[i] !== -1 ? 'rgba(16,185,129,0.15)' : 'var(--bg-elevated)',
                    border: currentQ === i ? '2px solid var(--accent-secondary)' :
                      answers[i] !== -1 ? '1px solid rgba(16,185,129,0.25)' : '1px solid var(--border)',
                    color: currentQ === i ? 'var(--accent-secondary)' :
                      answers[i] !== -1 ? 'var(--accent-success)' : 'var(--text-muted)',
                  }}>{i + 1}</button>
              ))}
            </div>
            <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
              {answered}/{questions.length} answered
            </p>

            <button onClick={handleSubmit} disabled={submitting}
              className="gradient-button w-full mt-6 py-2.5 text-sm flex items-center justify-center gap-2">
              {submitting ? <Spinner size="sm" className="text-white" /> : "Submit Test"}
            </button>
          </div>

          {/* Question Card */}
          <div className="col-span-9 glass-card p-8">
            <p className="text-lg font-medium mb-6 leading-relaxed">{q.question}</p>

            <div className="space-y-3">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => handleAnswerSelect(oi)}
                  className="w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-4"
                  style={{
                    background: answers[currentQ] === oi ? 'rgba(124,58,237,0.15)' : 'var(--bg-elevated)',
                    border: answers[currentQ] === oi ? '1px solid rgba(124,58,237,0.3)' : '1px solid var(--border)',
                    color: answers[currentQ] === oi ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}>
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0"
                    style={{
                      background: answers[currentQ] === oi ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                      color: answers[currentQ] === oi ? 'white' : 'var(--text-muted)',
                    }}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                className="px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                ← Previous
              </button>
              <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                disabled={currentQ === questions.length - 1}
                className="px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== RESULTS PHASE =====
  if (phase === 'results' && result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100)
    const passed = percentage >= 60

    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <div className="p-8 rounded-3xl mb-8 text-center glass-card"
            style={{
              background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Your Score</p>
            <h1 className="text-6xl font-bold mb-2 animate-count-up"
              style={{ color: passed ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {result.score}/{result.totalQuestions}
            </h1>
            <p className="text-lg font-medium"
              style={{ color: passed ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {percentage}% — {passed ? 'Passed! 🎉' : 'Keep Practicing 💪'}
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button onClick={() => navigate(`/app/session/${sessionId}`)}
              className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-white/10"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              Back to Dashboard
            </button>
            <button onClick={() => { setPhase('config'); setResult(null); }}
              className="gradient-button px-5 py-2.5 text-sm">
              Take Another Test
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-4">Question Review</h2>
          <div className="space-y-4">
            {result.questions.map((q, i) => {
              const isCorrect = q.userAnswer === q.correctAnswer
              return (
                <div key={i} className="glass-card p-5"
                  style={{
                    background: isCorrect ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                    border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                  }}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                      style={{
                        background: isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)',
                        color: isCorrect ? 'black' : 'white',
                      }}>{isCorrect ? '✓' : '✗'}</span>
                    <p className="font-medium">{q.question}</p>
                  </div>
                  <div className="ml-9 space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <p key={oi} className="text-sm px-3 py-1.5 rounded-lg"
                        style={{
                          background: oi === q.correctAnswer ? 'rgba(16,185,129,0.1)' : 'transparent',
                          color: oi === q.correctAnswer ? '#6EE7B7' :
                            oi === q.userAnswer && oi !== q.correctAnswer ? '#FCA5A5' : 'var(--text-muted)',
                          textDecoration: oi === q.userAnswer && oi !== q.correctAnswer ? 'line-through' : 'none',
                          fontWeight: oi === q.correctAnswer ? 500 : 400,
                        }}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </p>
                    ))}
                  </div>
                  <p className="ml-9 mt-3 text-sm rounded-lg px-3 py-2"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-warning)', fontWeight: 500 }}>Explanation:</span> {q.explanation}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AptitudeTest
