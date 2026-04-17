import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../services/api'

export default function UserProfilePage() {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    api.get(`/user/${id}`).then((res) => setProfile(res.data)).catch(() => setProfile(null))
    api.get(`/user/${id}/wishlist`).then((res) => setWishlist(res.data || [])).catch(() => setWishlist([]))
    api.get(`/social/reviews/user/${id}`).then((res) => setReviews(res.data || [])).catch(() => setReviews([]))
  }, [id])

  if (!profile) return <p className="muted">Loading profile...</p>

  return (
    <section className="fade-in profile-layout">
      <div className="card">
        <h2>@{profile.username}</h2>
        <p>Followers: {profile.followers} • Following: {profile.following}</p>
      </div>
      <div className="card">
        <h3>Wishlist</h3>
        <div className="review-list">
          {wishlist.map((w) => <article key={w.id} className="review-item">{w.anime?.title}</article>)}
        </div>
      </div>
      <div className="card">
        <h3>Recent Reviews</h3>
        <div className="review-list">
          {(reviews.length ? reviews : profile?.recentReviews || []).map((r) => (
            <article key={`${r.id}-${r.anime?.id || 'anon'}`} className="review-item">
              <p><strong>{r.anime?.title || r.anime?.name || 'Unknown anime'}</strong></p>
              <p>{r.content}</p>
            </article>
          ))}
          {(reviews.length === 0 && !(profile?.recentReviews || []).length) && <p className="muted">No reviews yet.</p>}
        </div>
      </div>
    </section>
  )
}
