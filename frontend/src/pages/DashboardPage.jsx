import { useEffect, useRef, useState } from 'react'
import AnimeCard from '../components/AnimeCard'

function RowSection({ title, subtitle, items, onToggle, watchlistIds }) {
  if (!items.length) return null

  return (
    <section className="row">
      <h3>{title}</h3>
      {subtitle && <p className="muted row-subtitle">{subtitle}</p>}
      <div className="row-scroll no-scrollbar">
        {items.map((anime, idx) => (
          <AnimeCard key={`${title}-${anime.id}-${idx}`} anime={anime} onToggle={onToggle} inList={watchlistIds.has(anime.id)} />
        ))}
      </div>
    </section>
  )
}

export default function DashboardPage({ topAnime, searchResults, loadingSearch, onToggleList, watchlistIds }) {
  const [heroIndex, setHeroIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const heroPool = topAnime.slice(0, 5)
  const trackRef = useRef(null)

  useEffect(() => {
    if (!heroPool.length || paused) return
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroPool.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroPool.length, paused])

  const featured = heroPool[heroIndex] || topAnime[0]
  const topRated = [...topAnime].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 16)

  const scrollTop5 = (dir) => {
    if (!trackRef.current) return
    trackRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  return (
    <div className="fade-in">
      {featured && (
        <section className="hero-banner hero-zoom" style={{ backgroundImage: `url(${featured.banner || featured.image})` }}>
          <div className="hero-gradient-overlay" />
          <div className="hero-text fade-content">
            <p className="muted">Featured Anime</p>
            <h2>{featured.title}</h2>
            <p>{featured.synopsis?.slice(0, 180) || 'Cinematic anime recommendation.'}</p>
            <div className="hero-actions">
              <button onClick={() => onToggleList(featured)}>{watchlistIds.has(featured.id) ? 'Remove' : '➕ Add to List'}</button>
            </div>
          </div>
        </section>
      )}

      {!!heroPool.length && (
        <section className="row" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="row-head-with-actions">
            <h3>🏆 Top 5 Carousel</h3>
            <div>
              <button className="secondary" onClick={() => scrollTop5(-1)}>◀</button>
              <button className="secondary" onClick={() => scrollTop5(1)}>▶</button>
            </div>
          </div>
          <div className="row-scroll no-scrollbar" ref={trackRef}>
            {heroPool.map((anime) => <AnimeCard key={`top5-${anime.id}`} anime={anime} onToggle={onToggleList} inList={watchlistIds.has(anime.id)} />)}
          </div>
        </section>
      )}

      {loadingSearch && <p className="muted">Searching anime from Jikan API...</p>}
      {!!searchResults.length && (
        <section className="row">
          <h3>🔍 Search Results</h3>
          <div className="anime-grid">
            {searchResults.map((anime) => (
              <AnimeCard key={`search-${anime.id}`} anime={anime} onToggle={onToggleList} inList={watchlistIds.has(anime.id)} />
            ))}
          </div>
        </section>
      )}

      {!searchResults.length && (
        <>
          <RowSection title="🔥 Top Anime" subtitle="Top anime list from Jikan." items={topAnime.slice(0, 16)} onToggle={onToggleList} watchlistIds={watchlistIds} />
          <RowSection title="⭐ Top Rated Anime" subtitle="Highest rated picks." items={topRated} onToggle={onToggleList} watchlistIds={watchlistIds} />
          <RowSection title="🎯 Recommended For You" subtitle="Curated from top anime ranking." items={topAnime.slice(5, 21)} onToggle={onToggleList} watchlistIds={watchlistIds} />
        </>
      )}
    </div>
  )
}
