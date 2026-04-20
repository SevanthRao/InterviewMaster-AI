import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from "../../../hooks/useAuth"
import Spinner from '../../../components/Spinner'
import AuthLayout from '../../../layouts/AuthLayout'
import PageLoader from '../../../components/PageLoader'

const Register = () => {
  const navigate = useNavigate()
  const { user, loading, handleRegister } = useAuth()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const validate = () => {
    const errors = {}

    if (!username.trim()) {
      errors.username = "Username is required"
    } else if (username.trim().length < 3) {
      errors.username = "At least 3 characters"
    }

    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "At least 6 characters"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!validate()) {
      return
    }

    setSubmitting(true)
    const result = await handleRegister({ username, email, password })
    setSubmitting(false)

    if (result.success) {
      navigate("/app")
    } else {
      setError(result.error)
    }
  }

  if (loading) {
    return <PageLoader message="Loading..." />
  }

  if (user) {
    return <Navigate to="/app" replace />
  }

  return (
    <AuthLayout title="Create account" subtitle="Start your interview prep journey with Interlix">
      {error && (
        <div className="mb-5 p-3.5 rounded-xl flex items-center gap-2.5 text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#FCA5A5',
          }}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setFieldErrors((prev) => ({ ...prev, username: "" }))
            }}
            className="input-field"
            style={fieldErrors.username ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
          />
          {fieldErrors.username && (
            <p className="text-xs mt-1.5 ml-0.5" style={{ color: '#F87171' }}>{fieldErrors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setFieldErrors((prev) => ({ ...prev, email: "" }))
            }}
            className="input-field"
            style={fieldErrors.email ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
          />
          {fieldErrors.email && (
            <p className="text-xs mt-1.5 ml-0.5" style={{ color: '#F87171' }}>{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setFieldErrors((prev) => ({ ...prev, password: "" }))
            }}
            className="input-field"
            style={fieldErrors.password ? { borderColor: 'rgba(239,68,68,0.5)' } : {}}
          />
          {fieldErrors.password && (
            <p className="text-xs mt-1.5 ml-0.5" style={{ color: '#F87171' }}>{fieldErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="gradient-button w-full py-3 text-sm flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Spinner size="sm" className="text-white" />
              <span>Creating account...</span>
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
        Already have an account?{" "}
        <Link to="/login" className="font-medium transition-colors hover:underline"
          style={{ color: 'var(--accent-primary-light)' }}>
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Register
