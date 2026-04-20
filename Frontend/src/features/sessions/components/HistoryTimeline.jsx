const HistoryTimeline = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        History will appear here after analysis and generation actions.
      </p>
    )
  }

  return (
    <div className="space-y-0">
      {history.map((entry, index) => (
        <div key={`${entry.type}-${entry.createdAt}-${index}`} className="flex gap-4">
          {/* Timeline line + dot */}
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
              style={{ background: 'var(--accent-primary-light)' }} />
            {index < history.length - 1 && (
              <div className="w-px flex-1 my-1" style={{ background: 'var(--border)' }} />
            )}
          </div>

          {/* Content */}
          <div className="pb-5 flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {entry.label}
            </p>
            {entry.detail && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {entry.detail}
              </p>
            )}
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {new Date(entry.createdAt).toLocaleString('en-US', {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default HistoryTimeline
