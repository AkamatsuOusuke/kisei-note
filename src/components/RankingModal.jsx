const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingModal({ ranking, loading, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ranking-page">
        <div className="notebook-page__header">
          <div>
            <p className="notebook-page__eyebrow">ランキング</p>
            <h2>帰省したい街</h2>
          </div>
          <button className="notebook-page__close" onClick={onClose}>✕</button>
        </div>

        {loading ? (
          <p className="notebook-page__loading">読み込み中…</p>
        ) : ranking.length === 0 ? (
          <p className="notebook-page__empty">まだ「帰省したい」が届いていません。</p>
        ) : (
          <ol className="ranking-list">
            {ranking.map((place, i) => (
              <li key={place.id} className="ranking-list__item">
                <span className="ranking-list__rank">{MEDALS[i] || `${i + 1}`}</span>
                <span className="ranking-list__city">
                  {place.city}
                  {place.prefecture ? <span className="ranking-list__prefecture">（{place.prefecture}）</span> : null}
                </span>
                <span className="ranking-list__count">💛 {place.kaisei_count}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
