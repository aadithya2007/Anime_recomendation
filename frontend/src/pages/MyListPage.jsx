import AnimeCard from '../components/AnimeCard'

export default function MyListPage({ watchlist, onRemove }) {
  return (
    <section className="fade-in">
      <h2>My List</h2>
      {watchlist.length === 0 && <p className="muted">No anime in your list yet.</p>}
      <div className="anime-grid">
        {watchlist.map((item) => (
          <div key={item.id} className="list-item-wrap">
            <AnimeCard anime={item} />
            <button className="danger" onClick={() => onRemove(item.id)}>Remove</button>
          </div>
        ))}
      </div>
    </section>
  )
}
