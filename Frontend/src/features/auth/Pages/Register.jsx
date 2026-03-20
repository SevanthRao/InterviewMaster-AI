import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from "../hooks/useAuth"

const Register = () => {
  const navigate = useNavigate()

  const { loading, handleRegister } = useAuth()

  const [username, setusername] = useState("")
  const [email, setemail] = useState("")
  const [password, setpassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleRegister({ username, email, password })
    navigate("/")
  }

  if (loading) {
    return (
      <main className='min-h-screen flex items-center justify-center bg-black'>
        <h1 className='text-3xl font-semibold text-white animate-pulse tracking-wide'>
          Loading...
        </h1>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-125 h-125 bg-purple-500/20 blur-[120px] rounded-full -top-25 -left-25" />
      <div className="absolute w-125 h-125 bg-blue-500/20 blur-[120px] rounded-full -bottom-25 -right-25" />

      {/* Card */}
      <div className="relative w-full max-w-md px-8 py-10 rounded-3xl 
        bg-white/5 backdrop-blur-xl border border-white/10 
        shadow-[0_10px_40px_rgba(0,0,0,0.6)]">

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-white text-center mb-8 tracking-wide">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div className="relative">
            <input
              type="text"
              placeholder=" "
              onChange={(e) => setusername(e.target.value)}
              className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder-transparent outline-none 
              focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
            />
            <label className="absolute left-4 top-2 text-xs text-gray-400 
              transition-all peer-placeholder-shown:top-3.5 
              peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 
              peer-focus:top-2 peer-focus:text-xs">
              Username
            </label>
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder=" "
              onChange={(e) => setemail(e.target.value)}
              className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder-transparent outline-none 
              focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
            />
            <label className="absolute left-4 top-2 text-xs text-gray-400 
              transition-all peer-placeholder-shown:top-3.5 
              peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 
              peer-focus:top-2 peer-focus:text-xs">
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type="password"
              placeholder=" "
              onChange={(e) => setpassword(e.target.value)}
              className="peer w-full px-4 pt-5 pb-2 rounded-xl bg-white/5 border border-white/10 text-white 
              placeholder-transparent outline-none 
              focus:border-white/30 focus:ring-2 focus:ring-white/20 transition-all"
            />
            <label className="absolute left-4 top-2 text-xs text-gray-400 
              transition-all peer-placeholder-shown:top-3.5 
              peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-500 
              peer-focus:top-2 peer-focus:text-xs">
              Password
            </label>
          </div>

          {/* Button */}
          <button
            className="w-full py-2.5 rounded-xl font-semibold text-black 
            bg-linear-to-r from-white to-gray-200 
            hover:opacity-90 active:scale-[0.98] transition-all duration-200 
            shadow-lg shadow-white/10"
          >
            Register
          </button>

        </form>

        {/* Footer */}
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