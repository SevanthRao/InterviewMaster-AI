import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from "../hooks/useAuth"
import Spinner from '../../shared/Spinner'

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
      navigate("/")
    } else {
      setError(result.error)
    }
  }

  if (loading) {
    return (
      <main className='min-h-screen flex flex-col items-center justify-center bg-black'>
        <div className="animate-fade-in-up flex flex-col items-center gap-4">
          <Spinner size="xl" className="text-purple-400" />
          <p className="text-gray-400 text-sm tracking-wide animate-pulse">Loading...</p>
        </div>
      </main>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <div className="absolute w-125 h-125 bg-purple-500/20 blur-[120px] rounded-full -top-25 -left-25" />
      <div className="absolute w-125 h-125 bg-blue-500/20 blur-[120px] rounded-full -bottom-25 -right-25" />

      <div className="relative w-full max-w-md px-8 py-10 rounded-3xl 
        bg-white/5 backdrop-blur-xl border border-white/10 
        shadow-[0_10px_40px_rgba(0,0,0,0.6)] animate-fade-in-up">
        <h1 className="text-3xl font-semibold text-white text-center mb-8 tracking-wide">
          Create Account
        </h1>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm text-center flex items-center gap-2 justify-center">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder=" "
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setFieldErrors((prev) => ({ ...prev, username: "" }))
              }}
              className={`peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border text-white 
              placeholder-transparent outline-none 
              focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all
              ${fieldErrors.username ? 'border-red-400/50' : 'border-white/10'}`}
            />
            <label className="absolute left-4 top-2 text-xs text-gray-400 
              transition-all peer-placeholder-shown:top-3.5 
              peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 
              peer-focus:top-2 peer-focus:text-xs">
              Username
            </label>
            {fieldErrors.username && (
              <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.username}</p>
            )}
          </div>

          <div className="relative">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setFieldErrors((prev) => ({ ...prev, email: "" }))
              }}
              className={`peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border text-white 
              placeholder-transparent outline-none 
              focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all
              ${fieldErrors.email ? 'border-red-400/50' : 'border-white/10'}`}
            />
            <label className="absolute left-4 top-2 text-xs text-gray-400 
              transition-all peer-placeholder-shown:top-3.5 
              peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 
              peer-focus:top-2 peer-focus:text-xs">
              Email
            </label>
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.email}</p>
            )}
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder=" "
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setFieldErrors((prev) => ({ ...prev, password: "" }))
              }}
              className={`peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border text-white 
              placeholder-transparent outline-none 
              focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all
              ${fieldErrors.password ? 'border-red-400/50' : 'border-white/10'}`}
            />
            <label className="absolute left-4 top-2 text-xs text-gray-400 
              transition-all peer-placeholder-shown:top-3.5 
              peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 
              peer-focus:top-2 peer-focus:text-xs">
              Password
            </label>
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1.5 ml-1">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl font-semibold text-black 
            bg-linear-to-r from-white to-gray-200 
            hover:opacity-90 active:scale-[0.98] transition-all duration-200 
            shadow-lg shadow-white/10 flex items-center justify-center gap-2
            disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="text-black" />
                <span>Creating account...</span>
              </>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-white hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  )
}

export default Register
