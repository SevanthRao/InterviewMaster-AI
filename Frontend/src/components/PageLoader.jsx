import Spinner from "./Spinner"

const PageLoader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}>
      <div className="animate-fade-in-up flex flex-col items-center gap-4">
        <Spinner size="xl" className="text-violet-400" />
        <p className="text-sm tracking-wide animate-pulse"
          style={{ color: 'var(--text-muted)' }}>
          {message}
        </p>
      </div>
    </div>
  )
}

export default PageLoader
