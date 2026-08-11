import Book from "./Book";

export default function Scene({ books, onOpenBook, onPlayOpenSfx, phase }) {
  return (
    <div className="scene">
      <div className="scene__sky" />
      <div className="scene__sun" />
      <div className="scene__ground" />

      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="scene__cloud"
          style={{ top: `${8 + i * 6}%`, "--cloud-delay": `${i * 3.5}s`, "--cloud-dur": `${40 + i * 6}s` }}
        />
      ))}

      <div className="scene__books">
        {phase === "ready" && books.length > 0 ? (
          books.map((b) => (
            <Book
              key={b.type}
              type={b.type}
              place={b.place}
              onOpen={() => onOpenBook(b.type)}
              onPlayOpenSfx={onPlayOpenSfx}
            />
          ))
        ) : phase === "locating" || phase === "loading" ? (
          <p className="scene__hint">現在地を取得しています…</p>
        ) : phase === "error" ? null : (
          <p className="scene__hint">ノートが降りてくるのを待っています…</p>
        )}
      </div>
    </div>
  );
}
