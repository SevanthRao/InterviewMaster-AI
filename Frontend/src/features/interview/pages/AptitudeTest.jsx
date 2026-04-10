import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useToast } from '../../shared/toast.context'
import { generateAptitudeTest, submitAptitudeTest } from '../services/interview.api'
import Spinner from '../../shared/Spinner'

const TIME_OPTIONS = [10, 15, 20, 30]
const COUNT_OPTIONS = [10, 15, 20]

const AptitudeTest = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Phases: 'config' | 'test' | 'results'
  const [phase, setPhase] = useState('config')
  const [timeLimit, setTimeLimit] = useState(15)
  const [questionCount, setQuestionCount] = useState(10)
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Test state
  const [testId, setTestId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef(null)

  // Results
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

  // Timer
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
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="animate-fade-in-up max-w-lg w-full p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <button onClick={() => navigate(`/dashboard/${sessionId}`)}
            className="inline-flex items-center gap-2 mb-6 text-sm text-gray-400 hover:text-white transition-colors">
            <span>←</span> Back to Dashboard
          </button>

          <div className="text-center mb-8">
            <span className="text-4xl mb-3 block">🧠</span>
            <h2 className="text-2xl font-semibold mb-2">Aptitude Test</h2>
            <p className="text-gray-400 text-sm">Configure your test settings below</p>
          </div>

          {/* Time Limit */}
          <div className="mb-6">
            <label className="text-gray-400 text-sm mb-3 block">Time Limit</label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_OPTIONS.map(t => (
                <button key={t} onClick={() => setTimeLimit(t)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all
                  ${timeLimit === t
                      ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
                >{t} min</button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="mb-8">
            <label className="text-gray-400 text-sm mb-3 block">Number of Questions</label>
            <div className="grid grid-cols-3 gap-2">
              {COUNT_OPTIONS.map(c => (
                <button key={c} onClick={() => setQuestionCount(c)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all
                  ${questionCount === c
                      ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
                >{c} Qs</button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={generating}
            className="w-full py-3 rounded-xl font-semibold text-black bg-linear-to-r from-emerald-400 to-teal-300
            hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2
            disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {generating ? (
              <><Spinner size="sm" className="text-black" /><span>Generating...</span></>
            ) : "Start Test"}
          </button>
        </div>

        {generating && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="animate-fade-in-up flex flex-col items-center gap-5">
              <Spinner size="xl" className="text-emerald-400" />
              <p className="text-white text-lg font-medium">Generating your test...</p>
              <p className="text-gray-400 text-sm">This may take a moment</p>
            </div>
          </div>
        )}
      </main>
    )
  }

  // ===== TEST PHASE =====
  if (phase === 'test') {
    const q = questions[currentQ]
    const answered = answers.filter(a => a !== -1).length
    const isLowTime = timeLeft < 60

    return (
      <main className="min-h-screen bg-gray-900 text-white p-6">
        {/* Top Bar */}
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            <span className="text-emerald-400">Aptitude Test</span>
            <span className="text-gray-500 text-sm ml-3">Question {currentQ + 1} of {questions.length}</span>
          </h2>

          <div className={`px-4 py-2 rounded-xl font-mono text-lg font-bold ${isLowTime ? 'bg-red-500/20 text-red-400 border border-red-400/30 animate-pulse' : 'bg-white/5 border border-white/10 text-white'}`}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-12 gap-6">
          {/* Question Navigator */}
          <div className="col-span-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
            <p className="text-gray-500 text-sm mb-3 text-center">Questions</p>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-medium transition-all flex items-center justify-center
                  ${currentQ === i ? 'ring-2 ring-emerald-400 bg-emerald-500/20 text-emerald-300' :
                      answers[i] !== -1 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-400/20' :
                        'bg-white/5 border border-white/10 text-gray-500 hover:bg-white/10'}`}
                >{i + 1}</button>
              ))}
            </div>
            <p className="text-gray-600 text-xs text-center mt-4">{answered}/{questions.length} answered</p>

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full mt-6 py-2.5 rounded-xl font-semibold text-black bg-linear-to-r from-emerald-400 to-teal-300
              hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting ? <Spinner size="sm" className="text-black" /> : "Submit Test"}
            </button>
          </div>

          {/* Question Card */}
          <div className="col-span-9 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg">
            <p className="text-lg font-medium mb-6 leading-relaxed">{q.question}</p>

            <div className="space-y-3">
              {q.options.map((opt, oi) => (
                <button key={oi} onClick={() => handleAnswerSelect(oi)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center gap-4
                  ${answers[currentQ] === oi
                      ? 'bg-emerald-500/20 border border-emerald-400/40 text-white'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0
                  ${answers[currentQ] === oi ? 'bg-emerald-400 text-black' : 'bg-white/10 text-gray-400'}`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-all disabled:opacity-40"
              >← Previous</button>
              <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))} disabled={currentQ === questions.length - 1}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-all disabled:opacity-40"
              >Next →</button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ===== RESULTS PHASE =====
  if (phase === 'results' && result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100)
    const passed = percentage >= 60

    return (
      <main className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          {/* Score Card */}
          <div className={`p-8 rounded-3xl mb-8 text-center backdrop-blur-xl border shadow-lg
            ${passed ? 'bg-emerald-500/10 border-emerald-400/20' : 'bg-red-500/10 border-red-400/20'}`}>
            <p className="text-gray-400 text-sm mb-2">Your Score</p>
            <h1 className={`text-6xl font-bold mb-2 ${passed ? 'text-emerald-300' : 'text-red-300'}`}>
              {result.score}/{result.totalQuestions}
            </h1>
            <p className={`text-lg font-medium ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {percentage}% — {passed ? 'Passed! 🎉' : 'Keep Practicing 💪'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button onClick={() => navigate(`/dashboard/${sessionId}`)}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >Back to Dashboard</button>
            <button onClick={() => { setPhase('config'); setResult(null); }}
              className="px-5 py-2.5 rounded-xl font-medium text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 hover:bg-emerald-500/25 transition-all"
            >Take Another Test</button>
          </div>

          {/* Q&A Review */}
          <h2 className="text-xl font-semibold mb-4">Question Review</h2>
          <div className="space-y-4">
            {result.questions.map((q, i) => {
              const isCorrect = q.userAnswer === q.correctAnswer
              return (
                <div key={i} className={`p-5 rounded-xl border transition-all
                  ${isCorrect ? 'bg-emerald-500/5 border-emerald-400/20' : 'bg-red-500/5 border-red-400/20'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                      ${isCorrect ? 'bg-emerald-400 text-black' : 'bg-red-400 text-white'}`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <p className="font-medium">{q.question}</p>
                  </div>

                  <div className="ml-9 space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <p key={oi} className={`text-sm px-3 py-1.5 rounded-lg
                        ${oi === q.correctAnswer ? 'bg-emerald-500/15 text-emerald-300 font-medium' :
                          oi === q.userAnswer && oi !== q.correctAnswer ? 'bg-red-500/15 text-red-300 line-through' :
                            'text-gray-500'}`}>
                        {String.fromCharCode(65 + oi)}. {opt}
                      </p>
                    ))}
                  </div>

                  <p className="ml-9 mt-3 text-sm text-gray-400 bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-yellow-400 font-medium">Explanation:</span> {q.explanation}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    )
  }

  return null
}

export default AptitudeTest
