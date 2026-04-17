import { useEffect, useState } from 'react'
import api from '../services/api'

export default function SocialPage() {
  const [watchlist, setWatchlist] = useState([])
  const [rating, setRating] = useState({ animeId: '', score: 8 })
  const [review, setReview] = useState({ animeId: '', content: '' })
  const [watch, setWatch] = useState({ animeId: '', status: 'PLANNED' })
  const [friendId, setFriendId] = useState('')
  const [message, setMessage] = useState('')

  const loadWatchlist = async () => {
    try {
      const { data } = await api.get('/social/watchlist')
      setWatchlist(data)
    } catch {
      setWatchlist([])
    }
  }

  useEffect(() => {
    loadWatchlist()
  }, [])

  const submitRating = async (e) => {
    e.preventDefault()
    await api.post('/social/ratings', { ...rating, animeId: Number(rating.animeId), score: Number(rating.score) })
    setMessage('Rating saved')
  }

  const submitReview = async (e) => {
    e.preventDefault()
    await api.post('/social/reviews', { ...review, animeId: Number(review.animeId) })
    setMessage('Review added')
  }

  const submitWatchlist = async (e) => {
    e.preventDefault()
    await api.post('/social/watchlist', { ...watch, animeId: Number(watch.animeId) })
    setMessage('Watchlist updated')
    await loadWatchlist()
  }

  const submitFriend = async (e) => {
    e.preventDefault()
    await api.post(`/social/friends/${friendId}`)
    setMessage('Friend added')
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Social Features</h2>
        {message && <p>{message}</p>}

        <form onSubmit={submitRating}>
          <h3>Rate anime</h3>
          <input placeholder="Anime ID" value={rating.animeId} onChange={(e) => setRating({ ...rating, animeId: e.target.value })} />
          <input type="number" min="1" max="10" value={rating.score} onChange={(e) => setRating({ ...rating, score: e.target.value })} />
          <button type="submit">Save rating</button>
        </form>

        <form onSubmit={submitReview}>
          <h3>Write review</h3>
          <input placeholder="Anime ID" value={review.animeId} onChange={(e) => setReview({ ...review, animeId: e.target.value })} />
          <textarea placeholder="Your review" value={review.content} onChange={(e) => setReview({ ...review, content: e.target.value })} />
          <button type="submit">Post review</button>
        </form>

        <form onSubmit={submitWatchlist}>
          <h3>Watchlist</h3>
          <input placeholder="Anime ID" value={watch.animeId} onChange={(e) => setWatch({ ...watch, animeId: e.target.value })} />
          <select value={watch.status} onChange={(e) => setWatch({ ...watch, status: e.target.value })}>
            <option value="PLANNED">Planned</option>
            <option value="WATCHING">Watching</option>
            <option value="COMPLETED">Completed</option>
            <option value="DROPPED">Dropped</option>
          </select>
          <button type="submit">Save watchlist</button>
        </form>

        <form onSubmit={submitFriend}>
          <h3>Add friend</h3>
          <input placeholder="Friend user ID" value={friendId} onChange={(e) => setFriendId(e.target.value)} />
          <button type="submit">Add friend</button>
        </form>
      </section>

      <section className="card">
        <h2>My watchlist</h2>
        <ul>
          {watchlist.map((item) => (
            <li key={item.id}>{item.anime?.title || `Anime ${item.anime?.id}`} — {item.status}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
