import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { setAuthToken } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { setToken, setUser, setUserId } = useAuth()
  const navigate = useNavigate()

  const register = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/auth/register', form)
      setToken(data.token)
      setAuthToken(data.token)
      const profile = await api.get('/auth/me')
      setUser(profile.data.username)
      setUserId(String(profile.data.id))
      setMessage('Registered successfully.')
      setTimeout(() => navigate('/'), 600)
    } catch {
      setError('Registration failed. Try another username/email.')
    }
  }

  return (
    <div className="auth-wrapper">
      <form className="card auth-card" onSubmit={register}>
        <h2>Create account</h2>
        <p className="muted">Start building your anime recommendation profile.</p>
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Register</button>
        {message && <p>{message}</p>}
        {error && <p className="error">{error}</p>}
        <p className="muted">Already have account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  )
}
