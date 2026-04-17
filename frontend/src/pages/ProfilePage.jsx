import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage({ localReviews, watchlist, notifications, onDismissNotification }) {
  const { token, user, userId } = useAuth()
  const [avatar, setAvatar] = useState('')

  useEffect(() => {
    if (!userId) return
    setAvatar(localStorage.getItem(`avatar_${userId}`) || '')
  }, [userId])

  const dismissNotification = (id) => {
    if (onDismissNotification) {
      onDismissNotification(id)
    }
  }

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    const reader = new FileReader()
    reader.onload = () => {
      const val = String(reader.result)
      setAvatar(val)
      localStorage.setItem(`avatar_${userId}`, val)
    }
    reader.readAsDataURL(file)
  }

  if (!token) {
    return <p className="muted">Please sign in to view profile.</p>
  }

  return (
    <section className="fade-in profile-layout">
      <div className="card">
        <h2>My Profile</h2>
        <div className="profile-header">
          <img className="avatar" src={avatar || 'https://placehold.co/80x80/111/EEE?text=P'} alt="avatar" />
          <div>
            <p><strong>@{user || 'user'}</strong></p>
            {userId && <Link className="secondary" to={`/user/${userId}`}>View public profile</Link>}
            <label className="upload-btn">Change PFP<input type="file" accept="image/*" onChange={onAvatarChange} /></label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Notifications</h3>
        <div className="review-list">
          {notifications?.length === 0 && <p className="muted">No notifications.</p>}
          {(notifications || []).map((n) => (
            <article className="review-item notif-row" key={n.id}>
              <span>{n.message}</span>
              <button className="notif-dismiss" type="button" onClick={() => dismissNotification(n.id)}>×</button>
            </article>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>My List</h3>
        <div className="review-list">
          {(watchlist || []).length === 0 && <p className="muted">No anime in watchlist.</p>}
          {(watchlist || []).map((a) => (
            <article key={a.id} className="review-item">{a.title}</article>
          ))}
        </div>
      </div>

      <div className="card">
        <h3>My Local Reviews</h3>
        <div className="review-list">
          {Object.entries(localReviews || {}).flatMap(([animeId, arr]) => arr.map((r) => ({ ...r, animeId }))).map((r) => (
            <article key={`${r.id}-${r.animeId}`} className="review-item">
              <p><strong>Anime #{r.animeId}</strong> — ⭐ {r.rating}/10</p>
              <p>{r.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
