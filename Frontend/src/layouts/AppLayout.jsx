import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useParams, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../contexts/toast.context'
import { getAllSessions } from '../features/sessions/services/session.api'

const AppLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const navigate = useNavigate()
  const { user, handleLogout, authenticating } = useAuth()
  const { addToast } = useToast()
  const params = useParams()
  const location = useLocation()

  // Fetch sessions for sidebar
  useEffect(() => {
    let ignore = false

    const fetchSessions = async () => {
      try {
        const data = await getAllSessions()
        if (!ignore) {
          setSessions(data.sessions || [])
        }
      } catch {
        // Silently fail — sidebar sessions are non-critical
      } finally {
        if (!ignore) {
          setLoadingSessions(false)
        }
      }
    }

    fetchSessions()

    return () => {
      ignore = true
    }
  }, [location.pathname]) // Refetch when navigating (e.g. after creating a new session)

  const onLogout = async () => {
    const result = await handleLogout()
    if (!result.success) {
      addToast({ message: result.error || "Logout failed", type: "error" })
    } else {
      navigate('/login')
    }
  }

  const activeSessionId = params.sessionId

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          width: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo + Collapse */}
        <div className="flex items-center justify-between px-4 h-16 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}>
          {!sidebarCollapsed && (
            <span className="text-xl font-bold gradient-text tracking-tight">Interlix</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              )}
            </svg>
          </button>
        </div>

        {/* New Session Button */}
        <div className="px-3 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <NavLink
            to="/app"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full
              ${isActive ? 'text-white' : 'hover:bg-white/5'}`
            }
            style={({ isActive }) => ({
              background: isActive
                ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))'
                : undefined,
              border: isActive ? '1px solid rgba(124,58,237,0.2)' : '1px solid var(--border)',
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            })}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">New Session</span>
            )}
          </NavLink>
        </div>

        {/* Session History */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {!sidebarCollapsed && (
            <>
              {loadingSessions ? (
                <div className="flex justify-center py-4">
                  <svg className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] px-3 mb-2"
                    style={{ color: 'var(--text-muted)' }}>
                    Sessions
                  </p>
                  {sessions.map((session) => {
                    const isActive = activeSessionId === session._id
                    return (
                      <button
                        key={session._id}
                        onClick={() => navigate(`/app/session/${session._id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group"
                        style={{
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.08))'
                            : 'transparent',
                          border: isActive ? '1px solid rgba(124,58,237,0.15)' : '1px solid transparent',
                          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        {/* Mini score indicator */}
                        <div className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            background: session.matchScore >= 70 ? 'var(--accent-success)'
                              : session.matchScore >= 40 ? 'var(--accent-warning)'
                              : 'var(--accent-danger)',
                          }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{session.title}</p>
                          <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {session.matchScore}% match · {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>
                  No sessions yet
                </p>
              )}
            </>
          )}

          {/* Collapsed state — show dots for sessions */}
          {sidebarCollapsed && sessions.length > 0 && (
            <div className="flex flex-col items-center gap-2 py-2">
              {sessions.slice(0, 8).map((session) => (
                <button
                  key={session._id}
                  onClick={() => navigate(`/app/session/${session._id}`)}
                  title={session.title}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
                  style={{
                    background: activeSessionId === session._id
                      ? 'rgba(124,58,237,0.2)' : 'transparent',
                    border: activeSessionId === session._id
                      ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
                  }}
                >
                  <div className="w-2 h-2 rounded-full"
                    style={{
                      background: session.matchScore >= 70 ? 'var(--accent-success)'
                        : session.matchScore >= 40 ? 'var(--accent-warning)'
                        : 'var(--accent-danger)',
                    }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User section */}
        <div className="px-3 py-4 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          {!sidebarCollapsed && user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}>
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {user.username || 'User'}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  {user.email || ''}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            disabled={authenticating}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: '#F87171' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            {!sidebarCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}

export default AppLayout
