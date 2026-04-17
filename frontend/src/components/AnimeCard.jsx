import { Link } from 'react-router-dom'

export default function AnimeCard({ anime, inList, onToggle }) {
  return (
    <Link className="anime-card" to={`/details/${anime.id}`}>
      {anime.rank ? <span className="rank-badge">#{anime.rank}</span> : null}
      <img src={anime.image || 'https://placehold.co/300x420/111/EEE?text=Anime'} alt={anime.title} loading="lazy" />
      <div className="anime-card-overlay">
        <h4>{anime.title}</h4>
        <p>{anime.genre || 'Unknown'}</p>
        <span>⭐ {anime.rating ?? 'N/A'}</span>
        {onToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              onToggle(anime)
            }}
          >
            {inList ? 'Remove' : '+ Add to List'}
          </button>
        )}
      </div>
    </Link>
  )
}
