import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useToast } from '../../../contexts/toast.context'
import { createSession, getAllSessions } from '../services/session.api'
import Spinner from '../../../components/Spinner'
import SessionCard from '../components/SessionCard'

const SessionsHome = () => {
  const [jobDescription, setJobDescription] = useState("")
  const [selfDescription, setSelfDescription] = useState("")
  const [resumeFile, setResumeFile] = useState(null)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const { addToast } = useToast()
  const fileInputRef = useRef(null)
  const dragCounterRef = useRef(0)

  const navigate = useNavigate()

  const MAX_FILE_SIZE = 3 * 1024 * 1024

  useEffect(() => {
    let ignore = false

    const fetchSessions = async () => {
      try {
        const data = await getAllSessions()
        if (!ignore) {
          setSessions(data.sessions || [])
        }
      } catch {
        if (!ignore) {
          addToast({ message: "Past sessions could not be loaded right now.", type: "warning" })
        }
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
  }, [addToast])

  const processFile = useCallback((file) => {
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError("Only PDF files are accepted.")
      setResumeFile(null)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File too large. Maximum size is 3MB.")
      setResumeFile(null)
      return
    }
    setResumeFile(file)
    setError("")
  }, [MAX_FILE_SIZE])

  const handleFileChange = (e) => {
    processFile(e.target.files[0])
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounterRef.current = 0
    if (submitting) return
    const file = e.dataTransfer.files?.[0]
    processFile(file)
  }

  const handleRemoveFile = () => {
    setResumeFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleAnalyzeResume = async () => {
    setError("")
    if (!jobDescription.trim()) {
      setError("Please provide a Job Description.")
      return
    }
    if (!resumeFile) {
      setError("Please upload your Resume as PDF.")
      return
    }
    if (!selfDescription.trim()) {
      setError("Please provide a Self Description.")
      return
    }

    setSubmitting(true)
    try {
      const data = await createSession({ jobDescription, selfDescription, resumeFile })
      addToast({ message: "Resume analyzed successfully!", type: "success" })
      navigate(`/app/session/${data.session._id}`)
    } catch (err) {
      const message = err.response?.data?.message || "Failed to analyze resume. Please try again."
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
          <span className="gradient-text">Interlix</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Upload your resume and let AI prepare you for your next interview.
        </p>
      </div>

      {/* New Session Card */}
      <div className="glass-card p-10 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124,58,237,0.25)',
            }}>
            <svg className="w-5 h-5" style={{ color: 'var(--accent-primary-light)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>New Session</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Analyze a resume for a specific job</p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl flex items-center gap-3 animate-fade-in-up"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
            }}>
            <svg className="w-5 h-5 shrink-0" style={{ color: '#F87171' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium flex-1" style={{ color: '#FCA5A5' }}>{error}</p>
            <button onClick={() => setError("")}
              className="opacity-60 hover:opacity-100 transition-opacity"
              style={{ color: '#FCA5A5' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Job Description */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Job Description
            </label>
            <textarea
              placeholder="Paste the job posting here..."
              rows={12}
              disabled={submitting}
              onChange={(e) => setJobDescription(e.target.value)}
              className="textarea-field flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Right: Upload + Self Description */}
          <div className="flex flex-col gap-5">
            {/* Upload Drop Zone */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Upload Resume
              </label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                disabled={submitting}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {/* Drop zone */}
              {!resumeFile ? (
                <div
                  className="upload-drop-zone"
                  data-dragging={isDragging}
                  onClick={() => !submitting && fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    padding: '32px 24px',
                    borderRadius: 'var(--radius-lg)',
                    border: isDragging
                      ? '2px solid var(--accent-primary)'
                      : '2px dashed rgba(255,255,255,0.12)',
                    background: isDragging
                      ? 'rgba(124,58,237,0.08)'
                      : 'rgba(30,41,59,0.4)',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: submitting ? 0.5 : 1,
                  }}
                >
                  {/* Upload icon */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isDragging
                        ? 'rgba(124,58,237,0.2)'
                        : 'rgba(124,58,237,0.1)',
                      border: `1px solid ${isDragging ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.15)'}`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                      stroke={isDragging ? '#A78BFA' : '#7C3AED'}
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                      style={{
                        transition: 'all 0.3s ease',
                        transform: isDragging ? 'translateY(-2px)' : 'translateY(0)',
                      }}
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <p className="text-sm font-medium" style={{
                      color: isDragging ? 'var(--accent-primary-light)' : 'var(--text-primary)',
                      transition: 'color 0.3s ease',
                    }}>
                      {isDragging ? 'Drop your file here' : 'Drag & drop your resume'}
                    </p>
                    <p className="text-xs" style={{
                      color: 'var(--text-muted)',
                      marginTop: 4,
                    }}>
                      or <span style={{
                        color: 'var(--accent-primary-light)',
                        fontWeight: 500,
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px',
                      }}>browse files</span>
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 4,
                  }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent-primary)',
                      opacity: 0.5,
                    }} />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      PDF only, max 3MB
                    </p>
                  </div>
                </div>
              ) : (
                /* File selected state */
                <div
                  className="animate-fade-in-up"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  {/* PDF Icon */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    flexShrink: 0,
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>

                  {/* File info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-sm font-medium" style={{
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {resumeFile.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatFileSize(resumeFile.size)} • PDF
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={handleRemoveFile}
                    disabled={submitting}
                    title="Remove file"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      color: '#F87171',
                      opacity: submitting ? 0.4 : 0.7,
                    }}
                    onMouseEnter={(e) => {
                      if (!submitting) {
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = submitting ? '0.4' : '0.7'
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Self Description */}
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Self Description
              </label>
              <textarea
                placeholder="Tell us about yourself, your strengths, and goals..."
                rows={6}
                disabled={submitting}
                onChange={(e) => setSelfDescription(e.target.value)}
                className="textarea-field flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Analyze Button */}
            <div className="flex justify-end">
              <button
                className="gradient-button px-6 py-2.5 text-sm flex items-center gap-2"
                onClick={handleAnalyzeResume}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <span>Analyze Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analyzing Overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'rgba(11,15,26,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="animate-fade-in-up flex flex-col items-center gap-5">
            <Spinner size="xl" className="text-violet-400" />
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Analyzing your resume...</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This may take a moment</p>
          </div>
        </div>
      )}
    </>
  )
}

export default SessionsHome
