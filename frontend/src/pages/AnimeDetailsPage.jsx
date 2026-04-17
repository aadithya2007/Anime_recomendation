import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function AnimeDetailsPage({ anime, onAdd, reviews, onReview, onReviewChange }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, userId } = useAuth()
  const [text, setText] = useState('')
  const [rating, setRating] = useState(8)
  const [commentDrafts, setCommentDrafts] = useState({})
  const [local, setLocal] = useState([])
  const [serverReviews, setServerReviews] = useState([])

  const item = useMemo(() => anime.find((a) => String(a.id) === String(id)), [anime, id])

  useEffect(() => {
    setLocal(reviews[id] || [])
  }, [reviews, id])

  useEffect(() => {
    if (!id) return
    api.get(`/social/reviews/anime/${id}`)
      .then((res) => setServerReviews(res.data || []))
      .catch(() => setServerReviews([]))
  }, [id])

  const displayedReviews = useMemo(() => {
    const normalizedServer = serverReviews.map((r) => ({
      id: r.id,
      text: r.content,
      rating: r.rating ?? r.score ?? 'N/A',
      reviewer: r.user?.username || 'anonymous',
      reviewerId: r.user?.id || null,
      comments: r.comments || [],
      createdAt: r.createdAt || new Date().toISOString(),
    }))
    return [...normalizedServer, ...local]
  }, [serverReviews, local])

  if (!item) {
    return <p className="muted">Anime details not found.</p>
  }

  const persist = (next) => {
    setLocal(next)
    onReviewChange(id, next)
  }

  const submitReview = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    const review = {
      id: Date.now(),
      text,
      rating,
      reviewer: user || 'anonymous',
      reviewerId: userId || null,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
    }
    onReview(String(id), review)
    setText('')
    setRating(8)
  }

  const likeReview = (reviewId) => {
    persist(local.map((r) => r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r))
  }

  const addComment = (reviewId) => {
    const content = commentDrafts[reviewId]
    if (!content?.trim()) return
    persist(local.map((r) => r.id === reviewId ? {
      ...r,
      comments: [...(r.comments || []), { id: Date.now(), user: user || 'anonymous', content }],
    } : r))
    setCommentDrafts((prev) => ({ ...prev, [reviewId]: '' }))
  }

  return (
    <section className="details fade-in">
      <div className="details-banner" style={{ backgroundImage: `url(${item.banner || item.image})` }}>
        <div className="hero-gradient" />
      </div>

      <div className="details-content card">
        <h2>{item.title}</h2>
        <p>⭐ Rating: {item.rating || 'N/A'}</p>
        <p>🎞 Episodes: {item.episodes || 'Unknown'}</p>
        <p>🏢 Studio: {item.studio || 'Unknown'}</p>
        <p>🎭 Genre: {item.genre || 'Unknown'}</p>
        <p className="muted">{item.synopsis || 'No description available.'}</p>

        <div className="hero-actions">
          <button onClick={() => onAdd(item)}>➕ Add/Remove List</button>
          <button className="secondary">Recommend Similar</button>
        </div>
      </div>

      <div className="card review-card">
        <h3>Leave your review</h3>
        <form onSubmit={submitReview}>
          <label>Rating</label>
          <input type="number" min="1" max="10" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          <label>Review</label>
          <textarea rows="4" placeholder="What did you think about this anime?" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="submit">Submit Review</button>
        </form>

        <div className="review-list">
          {displayedReviews.length === 0 && <p className="muted">No reviews yet. Be the first one.</p>}
          {displayedReviews.map((r) => (
            <article className="review-item" key={r.id}>
              <p>
                <strong
                  className={r.reviewerId ? 'clickable' : ''}
                  onClick={() => r.reviewerId && navigate(`/user/${r.reviewerId}`)}
                >
                  @{r.reviewer || 'anonymous'}
                </strong> • ⭐ {r.rating}/10
              </p>
              <p>{r.text}</p>
              <div className="review-actions">
                <button className="secondary" onClick={() => likeReview(r.id)}>❤️ {r.likes || 0}</button>
              </div>
              <div className="profile-search-row">
                <input
                  placeholder="Add comment"
                  value={commentDrafts[r.id] || ''}
                  onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                />
                <button onClick={() => addComment(r.id)}>Comment</button>
              </div>
              <div className="comment-list">
                {(r.comments || []).map((c) => <p key={c.id}><strong>@{c.user}</strong>: {c.content}</p>)}
              </div>
              <small className="muted">{new Date(r.createdAt).toLocaleString()}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
