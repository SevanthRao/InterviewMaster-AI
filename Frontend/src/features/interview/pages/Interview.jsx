import  { useState } from 'react'
import { useInterview } from '../hooks/useInterview';

const NAV_ITEMS = [
  { id: 'technical', label: 'Technical' },
  { id: 'behavioral', label: 'Behavioral' },
  { id: 'roadmap', label: 'Roadmap' },
]

const Interview = () => {
  const [activeNav, setActiveNav] = useState('technical')
  const { report, loading } = useInterview()

  if (loading || !report) {
    return <div className="min-h-screen bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-black text-white p-6">Loading...</div>
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-black text-white p-6">

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">

        {/* LEFT NAV */}
        <div className="col-span-2 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm mb-4">Sections</p>

          <div className="space-y-2">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition 
                  ${activeNav === item.id 
                    ? 'bg-white text-black' 
                    : 'hover:bg-white/10 text-gray-300'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div className="col-span-7 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">

          {/* TECHNICAL */}
          {activeNav === 'technical' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Technical Questions</h2>

              <div className="space-y-4">
                {report.technicalQuestions.map((q, i) => (
                  <div key={i} className="bg-white/10 p-4 rounded-xl">
                    <p className="font-medium">Q{i + 1}. {q.question}</p>
                    <p className='text-blue-200'>
                      <span className='text-yellow-300'>Intention: </span>{q.intention}</p>
                    <p className="text-gray-300 mt-2 text-sm">
                      <span className='text-yellow-300'>Answer: </span>{q.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BEHAVIORAL */}
          {activeNav === 'behavioral' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Behavioral Questions</h2>

              <div className="space-y-4">
                {report.behavioralQuestions.map((q, i) => (
                  <div key={i} className="bg-white/10 p-4 rounded-xl">
                    <p className="font-medium">Q{i + 1}. {q.question}</p>
                    <p className="text-gray-300 mt-2 text-sm">
                      <span className='text-yellow-300'>Answer: </span>{q.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ROADMAP */}
          {activeNav === 'roadmap' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Preparation Roadmap</h2>

              <div className="space-y-4">
                {report.preparationPlan.map((day, i) => (
                  <div key={i} className="bg-white/10 p-4 rounded-xl">
                    <p className="font-semibold">Day {day.day} - {day.focus}</p>
                    <ul className="text-gray-300 text-sm mt-2 list-disc ml-5">
                      {day.tasks.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-3 space-y-6">

          {/* MATCH SCORE */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Match Score</p>
            <h1 className="text-5xl font-bold text-yellow-400">{report.matchScore}%</h1>
            <p className="text-gray-400 mt-2 text-sm">Strong match</p>
          </div>

          {/* SKILL GAPS */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-4">Skill Gaps</p>

            <div className="flex flex-wrap gap-2">
              {report.skillGaps.map((gap, i) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full text-sm 
                    ${gap.severity === 'high' && 'bg-red-500/20 text-red-400'}
                    ${gap.severity === 'mid' && 'bg-yellow-500/20 text-yellow-400'}
                    ${gap.severity === 'low' && 'bg-green-500/20 text-green-400'}
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