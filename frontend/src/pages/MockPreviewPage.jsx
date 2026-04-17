const mockRecommendations = [
  { id: 1, title: 'Frieren: Beyond Journey\'s End', genre: 'Fantasy', score: 9.6 },
  { id: 2, title: 'Fullmetal Alchemist: Brotherhood', genre: 'Adventure', score: 9.4 },
  { id: 3, title: 'Steins;Gate', genre: 'Sci-Fi', score: 9.2 },
]

const mockWatchlist = [
  { id: 101, title: 'Jujutsu Kaisen', status: 'WATCHING' },
  { id: 102, title: 'Vinland Saga', status: 'PLANNED' },
  { id: 103, title: 'Attack on Titan', status: 'COMPLETED' },
]

const mockReviews = [
  { id: 201, user: 'akira', anime: 'Mob Psycho 100', content: 'Great character growth and animation.' },
  { id: 202, user: 'noa', anime: '86', content: 'Emotional storytelling with strong pacing.' },
]

export default function MockPreviewPage() {
  return (
    <div className="preview-layout">
      <section className="card">
        <h2>Mocked Dashboard Preview</h2>
        <p className="muted">This screen is a static mock to preview the intended frontend UX without backend connectivity.</p>

        <h3>Top Recommendations</h3>
        <div className="stack">
          {mockRecommendations.map((item) => (
            <article className="preview-item" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <p className="muted">{item.genre}</p>
              </div>
              <span className="pill">{item.score}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>My Watchlist</h3>
        <div className="stack">
          {mockWatchlist.map((item) => (
            <article className="preview-item" key={item.id}>
              <strong>{item.title}</strong>
              <span className="pill">{item.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Community Reviews</h3>
        <div className="stack">
          {mockReviews.map((item) => (
            <article className="review-item" key={item.id}>
              <p><strong>@{item.user}</strong> reviewed <strong>{item.anime}</strong></p>
              <p className="muted">{item.content}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
