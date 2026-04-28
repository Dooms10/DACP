import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'dacp_auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth on mount
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.email) {
          setUser(parsed)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Simple mock authentication
    // In production, this would call a real API
    if (email && password) {
      const userData = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'user'
      }
      setUser(userData)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const signup = (email, password, name) => {
    // Simple mock signup
    // In production, this would call a real API
    if (email && password && name) {
      const userData = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user'
      }
      setUser(userData)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: 'All fields are required' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}