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
    return (<main className='min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000]'>
      <h1 className='text-4xl font-semibold text-white text-bold'>Loading.........</h1>
    </main>
  )}



  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#000000]">

      <div className="w-full max-w-md px-6 py-8 rounded-2xl backdrop-blur-lg bg-white/5 border border-white/10 shadow-lg">

        <h1 className="text-3xl font-semibold text-white mb-6 text-center">
          Create Account
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5">

          {/* Username */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 text-sm">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              onChange={(e) => setusername(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/40 transition"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 text-sm">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter email address"
              onChange={(e) => setemail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/40 transition"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="text-gray-300 mb-2 text-sm">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              onChange={(e) => setpassword(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-white/40 transition"
            />
          </div>

          {/* Button */}
          <button
            className="w-full bg-white text-black py-2 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Register
          </button>

        </form>

        <p className="text-gray-400 text-sm text-center mt-6">
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