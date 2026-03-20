import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview';
import { useAuth } from '../../auth/hooks/useAuth'

const NAV_ITEMS = [
  { id: 'technical', label: 'Technical' },
  { id: 'behavioral', label: 'Behavioral' },
  { id: 'roadmap', label: 'Roadmap' },
]

const Interview = () => {
  const [activeNav, setActiveNav] = useState('technical')
  const navigate = useNavigate()
  const { report, loading } = useInterview()
  const { handleLogout, loading: authLoading } = useAuth()

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <h1 className="text-white text-2xl animate-pulse">Loading Report...</h1>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">

      <div className="max-w-7xl mx-auto mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-all duration-200 text-sm text-gray-200"
        >
          <span aria-hidden="true">←</span>
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleLogout}
          disabled={authLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-400/30 bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 text-sm text-red-300 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span>Logout</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">

        {/* LEFT NAV */}
        <div className="col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">

          <p className="text-gray-500 text-lg text-center uppercase mb-4 tracking-wider">Menu</p>

          <div className="space-y-2">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200
                ${activeNav === item.id
                    ? 'bg-linear-to-r from-purple-500/20 to-blue-500/20 border border-white/10 text-white'
                    : 'hover:bg-white/10 text-gray-400'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div className="col-span-7 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">

          {/* SECTION TITLE */}
          <h2 className="text-2xl font-semibold mb-6 tracking-wide">
            {activeNav === 'technical' && 'Technical Questions'}
            {activeNav === 'behavioral' && 'Behavioral Questions'}
            {activeNav === 'roadmap' && 'Preparation Roadmap'}
          </h2>

          {/* CONTENT */}
          <div className="space-y-5">

            {/* TECH */}
            {activeNav === 'technical' &&
              report.technicalQuestions.map((q, i) => (
                <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                  <p className="font-medium mb-2">Q{i + 1}. {q.question}</p>

                  <p className="text-sm text-blue-300 mb-1">
                    <span className="text-yellow-400">Intention:</span> {q.intention}
                  </p>

                  <p className="text-sm text-gray-300">
                    <span className="text-yellow-400">Answer:</span> {q.answer}
                  </p>
                </div>
              ))
            }

            {/* BEHAVIORAL */}
            {activeNav === 'behavioral' &&
              report.behavioralQuestions.map((q, i) => (
                <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                  <p className="font-medium mb-2">Q{i + 1}. {q.question}</p>

                  <p className="text-sm text-blue-300 mb-1">
                    <span className="text-yellow-400">Intention:</span> {q.intention}
                  </p>

                  <p className="text-sm text-gray-300">
                    <span className="text-yellow-400">Answer:</span> {q.answer}
                  </p>
                </div>
              ))
            }

            {/* ROADMAP */}
            {activeNav === 'roadmap' &&
              report.preparationPlan.map((day, i) => {

                const tasks = Array.isArray(day.tasks[0])
                  ? day.tasks[0]
                  : day.tasks
                return (
                  <div
                    key={i}
                    className="relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                  >
                    {/* TOP SECTION */}
                    <div className="flex items-center justify-between mb-4">
                      {/* Day */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full 
              bg-linear-to-br from-purple-500 to-blue-500 text-white text-sm font-semibold">
                          {day.day}
                        </div>

                        <p className="font-semibold text-white">
                          Day {day.day}
                        </p>
                      </div>

                      {/* Focus Tag */}
                      <span className="text-xs text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/20">
                        {day.focus}
                      </span>

                    </div>

                    {/* TIMELINE */}
                    <div className="relative ml-4 pl-6 border-l border-white/10 space-y-4">

                      {tasks.map((t, idx) => (
                        <div key={idx} className="relative">

                          {/* Task */}
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {t}
                          </p>

                        </div>
                      ))}

                    </div>

                  </div>
                )
              })
            }

          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-3 space-y-6">

          {/* SCORE */}
          <div className="bg-linear-to-br from-yellow-400/20 to-yellow-200/10 border border-yellow-400/20 backdrop-blur-xl rounded-2xl p-6 text-center shadow-lg">
            <p className="text-gray-400 text-sm mb-2">Match Score</p>
            <h1 className="text-5xl font-bold text-yellow-300">
              {report.matchScore}%
            </h1>
          </div>

          {/* SKILLS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
            <p className="text-gray-400 text-sm mb-4">Skill Gaps</p>

            <div className="flex flex-wrap gap-2">
              {report.skillGaps.map((gap, i) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full text-xs font-medium
                    ${gap.severity === 'high' && 'bg-red-500/20 text-red-400 border border-red-400/20'}
                    ${gap.severity === 'medium' && 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/20'}
                    ${gap.severity === 'low' && 'bg-green-500/20 text-green-400 border border-green-400/20'}
                  `}
                >
                  {gap.skill}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}

export default Interview