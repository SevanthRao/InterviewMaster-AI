import { Link } from 'react-router'

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 40%, #0B0F1A 100%)',
        }}>
        {/* Decorative elements */}
        <div className="absolute w-96 h-96 rounded-full opacity-20 blur-[100px]"
          style={{ background: 'var(--accent-secondary)', top: '-10%', right: '-10%' }} />
        <div className="absolute w-80 h-80 rounded-full opacity-15 blur-[80px]"
          style={{ background: 'var(--accent-primary-light)', bottom: '-5%', left: '-5%' }} />

        {/* Floating grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />

        {/* Brand content */}
        <div className="relative z-10 text-center px-12 animate-fade-in-up">
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 animate-pulse-glow"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-3">Interlix</h1>
            <p className="text-lg font-light" style={{ color: 'rgba(255,255,255,0.7)' }}>
              AI-Powered Interview Mastery
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-4 mt-10">
            {[
              { icon: '🎯', text: 'AI Interview Preparation' },
              { icon: '📄', text: 'Smart Resume Analysis' },
              { icon: '🧠', text: 'Aptitude & Technical Tests' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  animationDelay: `${i * 0.15}s`,
                }}>
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/80 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4">
          <Link to="/" className="text-xl font-bold gradient-text">Interlix</Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md animate-fade-in-up">
            {title && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
