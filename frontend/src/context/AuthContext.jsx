import { createContext, useContext, useEffect, useState } from 'react'
import { setAuthToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(localStorage.getItem('authUser') || '')
  const [userId, setUserId] = useState(localStorage.getItem('authUserId') || '')

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      setAuthToken(token)
    } else {
      localStorage.removeItem('token')
      setAuthToken('')
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('authUser', user)
    } else {
      localStorage.removeItem('authUser')
    }
  }, [user])

  useEffect(() => {
    if (userId) {
      localStorage.setItem('authUserId', userId)
    } else {
      localStorage.removeItem('authUserId')
    }
  }, [userId])

  const logout = () => {
    setToken('')
    setUser('')
    setUserId('')
  }

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser, userId, setUserId, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
