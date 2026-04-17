import AnimeCard from '../components/AnimeCard'

export default function GenresPage({ anime, onAdd }) {
  const genres = ['Action', 'Romance', 'Thriller']

  return (
    <section className="fade-in">
      <h2>Genres</h2>
      {genres.map((g) => {
        const items = anime.filter((a) => `${a.genre}`.toLowerCase().includes(g.toLowerCase())).slice(0, 12)
        return (
          <div key={g} className="row">
            <h3>{g}</h3>
            <div className="row-scroll no-scrollbar">
              {(items.length ? items : anime.slice(0, 10)).map((item, idx) => (
                <AnimeCard key={`${g}-${item.id}-${idx}`} anime={item} onToggle={onAdd} />
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
