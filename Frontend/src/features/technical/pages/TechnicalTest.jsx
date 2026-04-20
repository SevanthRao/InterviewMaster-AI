import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useToast } from '../../../contexts/toast.context'
import { generateTechnicalTest, submitTechnicalTest } from '../services/technical.api'
import Spinner from '../../../components/Spinner'

const TechnicalTest = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [phase, setPhase] = useState('intro')
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [testId, setTestId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [currentQ, setCurrentQ] = useState(0)

  const [result, setResult] = useState(null)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const data = await generateTechnicalTest(sessionId)
      setTestId(data.technicalTest._id)
      setQuestions(data.technicalTest.questions)
      setAnswers(new Array(data.technicalTest.questions.length).fill(""))
      setPhase('test')
    } catch (err) {
      addToast({ message: err.response?.data?.message || "Failed to generate test", type: "error" })
    } finally {
      setGenerating(false)
    }
  }

  const handleAnswerChange = (value) => {
    setAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[currentQ] = value
      return newAnswers
    })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const data = await submitTechnicalTest(testId, answers)
      setResult(data.technicalTest)
      setPhase('results')
      addToast({ message: "Test submitted!", type: "success" })
    } catch (err) {
      addToast({ message: err.response?.data?.message || "Failed to submit test", type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  // ===== INTRO =====
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="animate-fade-in-up max-w-lg w-full p-10 glass-card text-center">
          <button onClick={() => navigate(`/app/session/${sessionId}`)}
            className="inline-flex items-center gap-2 mb-6 text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}>
            <span>←</span> Back to Dashboard
          </button>

          <span className="text-5xl mb-4 block">💻</span>
          <h2 className="text-2xl font-semibold mb-3">Technical Test</h2>
          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            5 basic-level DSA & programming concept questions tailored to your resume and job description.
          </p>
          <div className="p-4 rounded-xl text-left text-sm space-y-2 mb-8"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <p>📝 <span style={{ color: 'var(--text-primary)' }}>Fill-in-the-blank</span> — type your short answer</p>
            <p>📊 <span style={{ color: 'var(--text-primary)' }}>5 questions total</span> — basic difficulty level</p>
            <p>⏱ <span style={{ color: 'var(--text-primary)' }}>No time limit</span> — take your time</p>
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
              <Spinner size="xl" className="text-amber-400" />
              <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Generating questions...</p>
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
    const answered = answers.filter(a => a.trim() !== "").length

    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              <span style={{ color: 'var(--accent-warning)' }}>Technical Test</span>
              <span className="text-sm ml-3" style={{ color: 'var(--text-muted)' }}>
                Question {currentQ + 1} of {questions.length}
              </span>
            </h2>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{answered}/{questions.length} answered</span>
          </div>

          {/* Progress */}
          <div className="w-full h-1.5 rounded-full mb-8" style={{ background: 'var(--bg-elevated)' }}>
            <div className="h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'var(--accent-warning)' }} />
          </div>

          {/* Question Card */}
          <div className="glass-card p-8 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: 'var(--accent-warning)', color: 'black' }}>
                {currentQ + 1}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--accent-warning)' }}>
                {q.difficulty}
              </span>
            </div>

            <p className="text-lg font-medium mb-6 leading-relaxed">{q.question}</p>

            <div>
              <label className="text-sm mb-2 block" style={{ color: 'var(--text-muted)' }}>Your Answer</label>
              <input
                type="text"
                value={answers[currentQ]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer..."
                className="input-field text-lg py-4"
                autoFocus
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
              className="px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              ← Previous
            </button>

            {currentQ === questions.length - 1 ? (
              <button onClick={handleSubmit} disabled={submitting}
                className="gradient-button px-6 py-2.5 text-sm flex items-center gap-2">
                {submitting ? <Spinner size="sm" className="text-white" /> : "Submit Test"}
              </button>
            ) : (
              <button onClick={() => setCurrentQ(currentQ + 1)}
                className="px-5 py-2.5 rounded-xl text-sm transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ===== RESULTS =====
  if (phase === 'results' && result) {
    const total = result.questions.length
    const percentage = Math.round((result.score / total) * 100)
    const passed = percentage >= 60

    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          <div className="p-8 rounded-3xl mb-8 text-center glass-card"
            style={{
              background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Your Score</p>
            <h1 className="text-6xl font-bold mb-2 animate-count-up"
              style={{ color: passed ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {result.score}/{total}
            </h1>
            <p className="text-lg font-medium"
              style={{ color: passed ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
              {percentage}% — {passed ? 'Great Job! 🎉' : 'Keep Practicing 💪'}
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button onClick={() => navigate(`/app/session/${sessionId}`)}
              className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-white/10"
              style={{ color: 'var(--text-secondary)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              Back to Dashboard
            </button>
            <button onClick={() => { setPhase('intro'); setResult(null); }}
              className="gradient-button px-5 py-2.5 text-sm">
              Take Another Test
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-4">Answer Review</h2>
          <div className="space-y-4">
            {result.questions.map((q, i) => (
              <div key={i} className="glass-card p-5"
                style={{
                  background: q.isCorrect ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
                  border: `1px solid ${q.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
                }}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                    style={{
                      background: q.isCorrect ? 'var(--accent-success)' : 'var(--accent-danger)',
                      color: q.isCorrect ? 'black' : 'white',
                    }}>{q.isCorrect ? '✓' : '✗'}</span>
                  <p className="font-medium">{q.question}</p>
                </div>

                <div className="ml-9 space-y-2 text-sm">
                  <p className="px-3 py-1.5 rounded-lg"
                    style={{
                      color: q.isCorrect ? '#6EE7B7' : '#FCA5A5',
                      textDecoration: q.isCorrect ? 'none' : 'line-through',
                    }}>
                    Your answer: <span className="font-medium">{q.userAnswer || "(empty)"}</span>
                  </p>
                  {!q.isCorrect && (
                    <p className="px-3 py-1.5 rounded-lg"
                      style={{ color: '#6EE7B7', background: 'rgba(16,185,129,0.08)' }}>
                      Correct answer: <span className="font-medium">{q.correctAnswer}</span>
                    </p>
                  )}
                  <p className="rounded-lg px-3 py-2 mt-2"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--accent-warning)', fontWeight: 500 }}>Explanation:</span> {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default TechnicalTest
