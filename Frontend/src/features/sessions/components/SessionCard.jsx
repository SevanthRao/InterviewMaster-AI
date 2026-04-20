import MatchScoreGauge from './MatchScoreGauge'

const SessionCard = ({ session, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="glass-card glass-card-hover p-5 cursor-pointer flex items-center gap-5 active:scale-[0.99] transition-all"
    >
      {/* Score gauge */}
      <div className="shrink-0 w-20 h-20 relative">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="5" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke={session.matchScore >= 70 ? 'var(--accent-success)' : session.matchScore >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 34}
            strokeDashoffset={2 * Math.PI * 34 - (session.matchScore / 100) * 2 * Math.PI * 34}
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {session.matchScore}%
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {session.title}
        </h3>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        {session.history?.[0] && (
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
            Latest: {session.history[0].label}
          </p>
        )}
      </div>

      {/* Arrow */}
      <svg className="w-5 h-5 shrink-0" style={{ color: 'var(--text-muted)' }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </div>
  )
}

export default SessionCard
