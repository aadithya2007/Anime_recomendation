import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SocialPage from './pages/SocialPage'
import AnimeDetailsPage from './pages/AnimeDetailsPage'
import MyListPage from './pages/MyListPage'
import GenresPage from './pages/GenresPage'
import ProfilePage from './pages/ProfilePage'
import FollowPage from './pages/FollowPage'
import UserProfilePage from './pages/UserProfilePage'
import { useAuth } from './context/AuthContext'
import api from './services/api'

const CACHE_KEY = 'jikan_cache_v1'

const mapAnime = (item) => ({
  id: item.mal_id,
  title: item.title,
  genre: item.genres?.map((g) => g.name).join(', ') || 'Unknown',
  rating: item.score,
  synopsis: item.synopsis,
  episodes: item.episodes,
  studio: item.studios?.[0]?.name || 'Unknown',
  image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
  banner: item.trailer?.images?.maximum_image_url || item.images?.jpg?.large_image_url,
  rank: item.rank,
})

async function safeJikanFetch(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Jikan error: ${response.status}`)
  return response.json()
}

export default function App() {
  const { token, user, userId, setUser, setUserId, logout } = useAuth()
  const [query, setQuery] = useState('')
  const [topAnime, setTopAnime] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [watchlist, setWatchlist] = useState([])
  const [reviews, setReviews] = useState({})
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [toast, setToast] = useState('')
  const menuRef = useRef(null)

  const watchlistKey = userId ? `watchlist_${userId}` : 'watchlist_guest'
  const reviewsKey = userId ? `animeReviews_${userId}` : 'animeReviews_guest'

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setProfileMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    if (cached.topAnime?.length) setTopAnime(cached.topAnime)

    safeJikanFetch('https://api.jikan.moe/v4/top/anime?limit=25')
      .then((topJson) => {
        const top = (topJson.data || []).map(mapAnime)
        setTopAnime(top)
        localStorage.setItem(CACHE_KEY, JSON.stringify({ topAnime: top }))
      })
      .catch(() => {
        if (!cached.topAnime?.length) setTopAnime([])
      })
  }, [])

  useEffect(() => {
    if (!token) {
      setNotifications([])
      return
    }
    api.get('/notifications').then((res) => setNotifications(res.data || [])).catch(() => setNotifications([]))
  }, [token])

  useEffect(() => {
    if (!token) return
    if (user && userId) return

    api.get('/auth/me')
      .then((res) => {
        setUser(res.data.username)
        setUserId(String(res.data.id))
      })
      .catch(() => {
        setUser('')
        setUserId('')
        setToast('Unable to load profile info.')
      })
  }, [token, user, userId, setUser, setUserId])

  useEffect(() => {
    if (token && userId) {
      api.get(`/user/${userId}/wishlist`)
        .then((res) => setWatchlist((res.data || []).map((item) => item.anime || {})))
        .catch(() => setWatchlist(JSON.parse(localStorage.getItem(watchlistKey) || '[]')))
      return
    }
    setWatchlist(JSON.parse(localStorage.getItem(watchlistKey) || '[]'))
  }, [token, userId, watchlistKey])

  useEffect(() => {
    setReviews(JSON.parse(localStorage.getItem(reviewsKey) || '{}'))
  }, [reviewsKey])

  useEffect(() => {
    localStorage.setItem(watchlistKey, JSON.stringify(watchlist))
  }, [watchlist, watchlistKey])

  useEffect(() => {
    localStorage.setItem(reviewsKey, JSON.stringify(reviews))
  }, [reviews, reviewsKey])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 1800)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults([])
        setLoadingSearch(false)
        return
      }

      setLoadingSearch(true)
      try {
        const payload = await safeJikanFetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=20`)
        setSearchResults((payload.data || []).map(mapAnime))
      } catch {
        setSearchResults([])
      } finally {
        setLoadingSearch(false)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [query])

  const combined = useMemo(() => {
    const byId = new Map()
    ;[...topAnime, ...searchResults].forEach((item) => byId.set(item.id, item))
    return Array.from(byId.values())
  }, [topAnime, searchResults])

  const watchlistIds = useMemo(() => new Set(watchlist.map((w) => w.id)), [watchlist])

  const toggleList = async (anime) => {
    const existed = watchlistIds.has(anime.id)
    const previous = watchlist
    setWatchlist((prev) => existed ? prev.filter((w) => w.id !== anime.id) : [...prev, anime])
    setToast(existed ? 'Removed from list' : 'Added to list')

    if (!token) return

    try {
      if (existed) {
        await api.delete(`/list/remove/${anime.id}`)
      } else {
        await api.post(`/list/add/${anime.id}`)
      }
    } catch {
      setWatchlist(previous)
      setToast('Action failed, rolled back')
    }
  }

  const addReview = (animeId, review) => {
    setReviews((prev) => {
      const current = prev[animeId] || []
      return { ...prev, [animeId]: [review, ...current] }
    })
  }

  const updateReview = (animeId, nextReviews) => {
    setReviews((prev) => ({ ...prev, [animeId]: nextReviews }))
  }

  const dismissNotification = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await api.patch(`/notifications/${id}/read`)
    } catch {
      setToast('Unable to update notifications')
    }
  }

  return (
    <div className="netflix-shell">
      {toast && <div className="toast">{toast}</div>}
      <nav className="nav">
        <h1>AnimeFlix</h1>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/my-list">My List</Link>
          <Link to="/genres">Genres</Link>
        </div>
        <div className="nav-right">
          <input className="search" placeholder="Search anime title..." value={query} onChange={(e) => setQuery(e.target.value)} />
          {token ? <Link className="notif-icon" to="/profile" title="Notifications">🔔 {notifications.length}</Link> : null}
          <div className="profile-menu-wrap" ref={menuRef}>
            <button className="profile-icon" onClick={() => setProfileMenuOpen((v) => !v)} title={token ? (user || 'Profile') : 'Account'}>👤</button>
            {profileMenuOpen && (
              <div className="profile-dropdown card slide-down">
                {token ? (
                  <>
                    <Link to="/profile">Profile</Link>
                    <Link to="/follow">Follow</Link>
                    <Link to="/my-list">My List</Link>
                    <button className="secondary" onClick={logout}>Sign out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login">Sign in</Link>
                    <Link to="/register">Sign up</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container">
        <Routes>
          <Route path="/" element={<DashboardPage topAnime={topAnime} searchResults={searchResults} loadingSearch={loadingSearch} onToggleList={toggleList} watchlistIds={watchlistIds} />} />
          <Route path="/my-list" element={<MyListPage watchlist={watchlist} onRemove={(id) => toggleList({ id })} />} />
          <Route path="/genres" element={<GenresPage anime={combined} onAdd={toggleList} />} />
          <Route path="/details/:id" element={<AnimeDetailsPage anime={combined} onAdd={toggleList} reviews={reviews} onReview={addReview} onReviewChange={updateReview} />} />
          <Route path="/profile" element={<ProfilePage localReviews={reviews} watchlist={watchlist} notifications={notifications} onDismissNotification={dismissNotification} />} />
          <Route path="/follow" element={<FollowPage />} />
          <Route path="/user/:id" element={<UserProfilePage />} />
          <Route path="/social" element={<SocialPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </div>
  )
}
