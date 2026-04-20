const SkillGapBadge = ({ skill, severity }) => {
  const styles = {
    high: {
      background: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.25)',
      color: '#FCA5A5',
    },
    medium: {
      background: 'rgba(245,158,11,0.12)',
      border: '1px solid rgba(245,158,11,0.25)',
      color: '#FCD34D',
    },
    low: {
      background: 'rgba(16,185,129,0.12)',
      border: '1px solid rgba(16,185,129,0.25)',
      color: '#6EE7B7',
    },
  }

  const s = styles[severity] || styles.low

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
      style={s}>
      {skill}
    </span>
  )
}

export default SkillGapBadge
