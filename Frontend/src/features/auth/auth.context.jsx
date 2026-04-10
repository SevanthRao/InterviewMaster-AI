/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from "react"
import {
  getMe,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "./services/auth.api"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authenticating, setAuthenticating] = useState(false)

  useEffect(() => {
    let ignore = false

    const bootstrapAuth = async () => {
      try {
        const data = await getMe()

        if (!ignore) {
          setUser(data.user ?? null)
        }
      } catch {
        if (!ignore) {
          setUser(null)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    bootstrapAuth()

    return () => {
      ignore = true
    }
  }, [])

  const handleLogin = async ({ email, password }) => {
    setAuthenticating(true)

    try {
      const data = await loginRequest({ email, password })
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || "Login failed. Please try again."
      console.error("Login error:", message)
      return { success: false, error: message }
    } finally {
      setAuthenticating(false)
    }
  }

  const handleRegister = async ({ username, email, password }) => {
    setAuthenticating(true)

    try {
      const data = await registerRequest({ username, email, password })
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again."
      console.error("Register error:", message)
      return { success: false, error: message }
    } finally {
      setAuthenticating(false)
    }
  }

  const handleLogout = async () => {
    setAuthenticating(true)

    try {
      await logoutRequest()
      setUser(null)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || "Logout failed. Please try again."
      console.error("Logout error:", message)
      return { success: false, error: message }
    } finally {
      setAuthenticating(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticating,
        handleLogin,
        handleRegister,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
