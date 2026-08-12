import { useState } from "react";
import { formatDate } from "../lib/format";

export default function CurrentModal({ place, charms, loading, onClose, onSubmit }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="notebook-page">
        <div className="notebook-page__header">
          <div>
            <p className="notebook-page__eyebrow">現在地のノート</p>
            <h2>{place.city}</h2>
          </div>
          <button className="notebook-page__close" onClick={onClose}>✕</button>
        </div>

        <div className="notebook-page__body">
          <p className="notebook-page__hint">ここが地元の人に向けて、今いる場所の魅力を投稿してください。</p>

          <textarea
            className="notebook-page__textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="景色、食べ物、お店、出来事…この場所の魅力を書いてください"
          />
          <button className="notebook-page__submit" onClick={handleSubmit} disabled={submitting || !content.trim()}>
            {submitting ? "投稿中…" : "投稿する"}
          </button>

          <p className="notebook-page__hint notebook-page__hint--small">これまでの投稿</p>
          {loading ? (
            <p className="notebook-page__loading">読み込み中…</p>
          ) : charms.length === 0 ? (
            <p className="notebook-page__empty">まだ投稿がありません。最初の投稿者になりましょう。</p>
          ) : (
            <div className="entries-list">
              {charms.map((charm) => (
                <div key={charm.id} className="entry-card">
                  <div className="entry-date">{formatDate(charm.created_at)}</div>
                  <div className="entry-content">{charm.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
