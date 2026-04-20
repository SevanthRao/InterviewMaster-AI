import { Link } from 'react-router'

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
    title: 'AI Resume Analysis',
    description: 'Upload your resume and get instant AI-powered skill gap analysis with match scoring.',
    color: '#7C3AED',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
    title: 'Interview Preparation',
    description: 'Get tailored technical and behavioral questions with expert-level answers and strategies.',
    color: '#06B6D4',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    title: 'Aptitude & Technical Tests',
    description: 'Practice with AI-generated MCQs and coding questions customized to your job profile.',
    color: '#10B981',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'AI-Generated Resume',
    description: 'Download a professionally refined, ATS-friendly PDF resume tailored for your target role.',
    color: '#F59E0B',
  },
]

const STEPS = [
  { number: '01', title: 'Upload Resume', description: 'Upload your PDF resume with job description and self-intro.' },
  { number: '02', title: 'AI Analyzes', description: 'Our AI extracts skills, detects gaps, and generates a match score.' },
  { number: '03', title: 'Prepare & Practice', description: 'Get customized interview questions, tests, and a refined resume.' },
]

const Landing = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(11,15,26,0.8)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-2xl font-bold gradient-text tracking-tight">Interlix</span>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}>
              Login
            </Link>
            <Link to="/register"
              className="gradient-button px-5 py-2 text-sm rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[150px] -top-40 -left-40"
          style={{ background: 'var(--accent-primary)' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px] -bottom-20 -right-20"
          style={{ background: 'var(--accent-secondary)' }} />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 animate-fade-in-up"
            style={{
              background: 'rgba(124,58,237,0.1)',
              border: '1px solid rgba(124,58,237,0.2)',
              color: 'var(--accent-primary-light)',
            }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-xs font-semibold tracking-wide uppercase">AI-Powered Platform</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: '0.1s', color: 'var(--text-primary)' }}>
            Ace Your Next<br />
            <span className="gradient-text">Interview with AI</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up"
            style={{ animationDelay: '0.2s', color: 'var(--text-secondary)' }}>
            Upload your resume, get AI-powered analysis, practice with tailored 
            interview questions, and download a refined professional resume — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}>
            <Link to="/register"
              className="gradient-button px-8 py-3.5 text-base rounded-xl font-semibold">
              Get Started Free
            </Link>
            <Link to="/login"
              className="px-8 py-3.5 rounded-xl text-base font-medium transition-all hover:bg-white/5"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}>
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
              style={{ color: 'var(--accent-primary-light)' }}>How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Three Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {STEPS.map((step) => (
              <div key={step.number}
                className="glass-card glass-card-hover p-8 text-center">
                <div className="text-4xl font-extrabold mb-4 gradient-text opacity-70">{step.number}</div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
              style={{ color: 'var(--accent-secondary)' }}>Features</p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Everything You Need to Prepare
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 stagger-children">
            {FEATURES.map((feature) => (
              <div key={feature.title}
                className="glass-card glass-card-hover p-7 flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${feature.color}15`,
                    border: `1px solid ${feature.color}25`,
                    color: feature.color,
                  }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-20 relative">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute w-64 h-64 rounded-full opacity-20 blur-[80px] -top-20 -right-20"
              style={{ background: 'var(--accent-primary)' }} />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Ready to ace your interview?
              </h2>
              <p className="text-base mb-8" style={{ color: 'var(--text-secondary)' }}>
                Join Interlix and let AI prepare you for success. It&apos;s fast, smart, and personalized.
              </p>
              <Link to="/register"
                className="gradient-button inline-block px-8 py-3.5 text-base rounded-xl font-semibold">
                Get Started — It&apos;s Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto flex justify-center px-6">
          <span className="text-3xl font-bold gradient-text">Interlix</span>
        </div>
      </footer>
    </div>
  )
}

export default Landing
