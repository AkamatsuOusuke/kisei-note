import { useState } from "react";
import { formatDate } from "../lib/format";

export default function HometownModal({
  place,
  charms,
  loading,
  alreadyVoted,
  likedIds,
  onClose,
  onVoteKaisei,
  onLikeCharm,
}) {
  const [voting, setVoting] = useState(false);

  const handleVote = async () => {
    if (alreadyVoted || voting) return;
    setVoting(true);
    await onVoteKaisei();
    setVoting(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="notebook-page">
        <div className="notebook-page__header">
          <div>
            <p className="notebook-page__eyebrow">地元のノート</p>
            <h2>{place.city}</h2>
          </div>
          <button className="notebook-page__close" onClick={onClose}>✕</button>
        </div>

        <button
          className={`kaisei-btn ${alreadyVoted ? "kaisei-btn--voted" : ""}`}
          onClick={handleVote}
          disabled={alreadyVoted || voting}
        >
          <span className="kaisei-btn__icon">💛</span>
          <span>{alreadyVoted ? "帰省したいを届けました" : "帰省したい"}</span>
          <span className="kaisei-btn__count">{place.kaisei_count ?? 0}</span>
        </button>

        <div className="notebook-page__body">
          <p className="notebook-page__hint">この街にいる人たちが投稿した魅力です。</p>

          {loading ? (
            <p className="notebook-page__loading">読み込み中…</p>
          ) : charms.length === 0 ? (
            <p className="notebook-page__empty">まだ投稿がありません。</p>
          ) : (
            <div className="entries-list">
              {charms.map((charm) => {
                const liked = likedIds.has(charm.id);
                return (
                  <div key={charm.id} className="entry-card">
                    <div className="entry-date">{formatDate(charm.created_at)}</div>
                    <div className="entry-content">{charm.content}</div>
                    <button
                      className={`like-btn ${liked ? "like-btn--liked" : ""}`}
                      disabled={liked}
                      onClick={() => onLikeCharm(charm.id)}
                    >
                      {liked ? "❤️" : "🤍"} {charm.likes_count ?? 0}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
