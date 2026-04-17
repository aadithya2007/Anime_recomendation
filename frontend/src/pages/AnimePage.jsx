import { useEffect, useState } from 'react'
import api from '../services/api'

export default function AnimePage() {
  const [anime, setAnime] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', genre: '', synopsis: '' })

  useEffect(() => {
    loadAnime()
  }, [])

  const loadAnime = async () => {
    setLoading(true)
    setError('')

    try {
      const local = await api.get('/anime')
      if (local.data?.length) {
        setAnime(local.data)
        return
      }

      const jikan = await fetch('https://api.jikan.moe/v4/top/anime?limit=18')
      const payload = await jikan.json()
      const mapped = (payload.data || []).map((item) => ({
        id: item.mal_id,
        title: item.title,
        genre: item.genres?.map((g) => g.name).join(', ') || 'Unknown',
        synopsis: item.synopsis || 'No synopsis available.',
        image: item.images?.jpg?.image_url,
      }))
      setAnime(mapped)
    } catch {
      setError('Failed to load anime from local API and Jikan API.')
      setAnime([])
    } finally {
      setLoading(false)
    }
  }

  const submitAnime = async (e) => {
    e.preventDefault()
    try {
      await api.post('/anime', form)
      setForm({ title: '', genre: '', synopsis: '' })
      await loadAnime()
    } catch {
      setError('Could not save anime to local backend.')
    }
  }

  return (
    <div className="grid">
      <form className="card" onSubmit={submitAnime}>
        <h2>Add Anime (Local Backend)</h2>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
        <textarea placeholder="Synopsis" value={form.synopsis} onChange={(e) => setForm({ ...form, synopsis: e.target.value })} />
        <button type="submit">Save</button>
      </form>

      <section className="card">
        <h2>Anime Catalog (Backend + Jikan)</h2>
        {loading && <p className="muted">Loading anime...</p>}
        {error && <p className="error">{error}</p>}
        <div className="anime-grid">
          {anime.map((item) => (
            <article className="anime-tile" key={item.id}>
              <div className="anime-cover">
                {item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : <span>No Image</span>}
              </div>
              <div className="anime-content">
                <strong>{item.title}</strong>
                <p className="muted">{item.genre}</p>
                <p>{item.synopsis}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
