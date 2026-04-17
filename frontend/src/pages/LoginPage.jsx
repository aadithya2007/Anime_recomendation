import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { setAuthToken } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { setToken, setUser, setUserId } = useAuth()
  const navigate = useNavigate()

  const login = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/login', { identifier, password })
      setToken(data.token)
      setAuthToken(data.token)
      const profile = await api.get('/auth/me')
      setUser(profile.data.username)
      setUserId(String(profile.data.id))
      navigate('/')
    } catch {
      setError('Login failed. Please check username/email and password.')
    }
  }

  return (
    <div className="auth-wrapper">
      <form className="card auth-card" onSubmit={login}>
        <h2>Sign in</h2>
        <p className="muted">Use username or email to login.</p>
        <input placeholder="Username or Email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
        <p className="muted">No account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  )
}
