import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useToast } from '../../shared/toast.context'
import { generateTechnicalTest, submitTechnicalTest } from '../services/interview.api'
import Spinner from '../../shared/Spinner'

const TechnicalTest = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Phases: 'intro' | 'test' | 'results'
  const [phase, setPhase] = useState('intro')
  const [generating, setGenerating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Test state
  const [testId, setTestId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState([])
  const [currentQ, setCurrentQ] = useState(0)

  // Results
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
      <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
        <div className="animate-fade-in-up max-w-lg w-full p-10 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] text-center">
          <button onClick={() => navigate(`/dashboard/${sessionId}`)}
            className="inline-flex items-center gap-2 mb-6 text-sm text-gray-400 hover:text-white transition-colors">
            <span>←</span> Back to Dashboard
          </button>

          <span className="text-5xl mb-4 block">💻</span>
          <h2 className="text-2xl font-semibold mb-3">Technical Test</h2>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            5 basic-level DSA & programming concept questions tailored to your resume and job description.
          </p>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-8 text-left text-sm text-gray-400 space-y-2">
            <p>📝 <span className="text-gray-300">Fill-in-the-blank</span> — type your short answer</p>
            <p>📊 <span className="text-gray-300">5 questions total</span> — basic difficulty level</p>
            <p>⏱ <span className="text-gray-300">No time limit</span> — take your time</p>
          </div>

          <button onClick={handleGenerate} disabled={generating}
            className="w-full py-3 rounded-xl font-semibold text-black bg-linear-to-r from-orange-400 to-yellow-300
            hover:opacity-90 active:scale-[0.97] transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2
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
              <Spinner size="xl" className="text-orange-400" />
              <p className="text-white text-lg font-medium">Generating questions...</p>
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
    const answered = answers.filter(a => a.trim() !== "").length

    return (
      <main className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">
              <span className="text-orange-400">Technical Test</span>
              <span className="text-gray-500 text-sm ml-3">Question {currentQ + 1} of {questions.length}</span>
            </h2>
            <span className="text-gray-500 text-sm">{answered}/{questions.length} answered</span>
          </div>

          {/* Progress */}
          <div className="w-full bg-white/5 rounded-full h-1.5 mb-8">
            <div className="bg-orange-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>

          {/* Question Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-orange-400 text-black flex items-center justify-center text-sm font-bold">
                {currentQ + 1}
              </span>
              <span className="text-xs text-orange-300/80 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                {q.difficulty}
              </span>
            </div>

            <p className="text-lg font-medium mb-6 leading-relaxed">{q.question}</p>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Your Answer</label>
              <input
                type="text"
                value={answers[currentQ]}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer..."
                className="w-full px-4 py-10 rounded-xl bg-white/5 border border-white/10 text-white
                placeholder-gray-500 outline-none focus:border-orange-400/40 focus:ring-2 focus:ring-orange-400/20 transition-all text-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
              className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-all disabled:opacity-40"
            >← Previous</button>

            {currentQ === questions.length - 1 ? (
              <button onClick={handleSubmit} disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-semibold text-black bg-linear-to-r from-orange-400 to-yellow-300
                hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {submitting ? <Spinner size="sm" className="text-black" /> : "Submit Test"}
              </button>
            ) : (
              <button onClick={() => setCurrentQ(currentQ + 1)}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition-all"
              >Next →</button>
            )}
          </div>
        </div>
      </main>
    )
  }

  // ===== RESULTS =====
  if (phase === 'results' && result) {
    const total = result.questions.length
    const percentage = Math.round((result.score / total) * 100)
    const passed = percentage >= 60

    return (
      <main className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          {/* Score Card */}
          <div className={`p-8 rounded-3xl mb-8 text-center backdrop-blur-xl border shadow-lg
            ${passed ? 'bg-emerald-500/10 border-emerald-400/20' : 'bg-red-500/10 border-red-400/20'}`}>
            <p className="text-gray-400 text-sm mb-2">Your Score</p>
            <h1 className={`text-6xl font-bold mb-2 ${passed ? 'text-emerald-300' : 'text-red-300'}`}>
              {result.score}/{total}
            </h1>
            <p className={`text-lg font-medium ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
              {percentage}% — {passed ? 'Great Job! 🎉' : 'Keep Practicing 💪'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4 mb-8">
            <button onClick={() => navigate(`/dashboard/${sessionId}`)}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >Back to Dashboard</button>
            <button onClick={() => { setPhase('intro'); setResult(null); }}
              className="px-5 py-2.5 rounded-xl font-medium text-orange-300 bg-orange-500/15 border border-orange-400/30 hover:bg-orange-500/25 transition-all"
            >Take Another Test</button>
          </div>

          {/* Answers Review */}
          <h2 className="text-xl font-semibold mb-4">Answer Review</h2>
          <div className="space-y-4">
            {result.questions.map((q, i) => (
              <div key={i} className={`p-5 rounded-xl border
                ${q.isCorrect ? 'bg-emerald-500/5 border-emerald-400/20' : 'bg-red-500/5 border-red-400/20'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5
                    ${q.isCorrect ? 'bg-emerald-400 text-black' : 'bg-red-400 text-white'}`}>
                    {q.isCorrect ? '✓' : '✗'}
                  </span>
                  <p className="font-medium">{q.question}</p>
                </div>

                <div className="ml-9 space-y-2 text-sm">
                  <p className={`px-3 py-1.5 rounded-lg ${q.isCorrect ? 'text-emerald-300' : 'text-red-300 line-through'}`}>
                    Your answer: <span className="font-medium">{q.userAnswer || "(empty)"}</span>
                  </p>
                  {!q.isCorrect && (
                    <p className="px-3 py-1.5 rounded-lg text-emerald-300 bg-emerald-500/10">
                      Correct answer: <span className="font-medium">{q.correctAnswer}</span>
                    </p>
                  )}
                  <p className="text-gray-400 bg-white/5 rounded-lg px-3 py-2 mt-2">
                    <span className="text-yellow-400 font-medium">Explanation:</span> {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return null
}

export default TechnicalTest
