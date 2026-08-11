import Book from "./Book";
import bgPhoto from "../assets/meadow-bg.webp";

// 現在地の本から先に落ちてくるようにする
const DROP_ORDER = { current: 0, hometown: 1 };
const DROP_STAGGER = 0.55; // 秒

export default function Scene({ books, onOpenBook, onPlayOpenSfx, onPlayDropSfx, phase }) {
  return (
    <div className="scene">
      {/* photo background（軽量webpに圧縮した草原写真） */}
      <div className="scene__bg" style={{ backgroundImage: `url(${bgPhoto})` }} />

      {/* soft vignette overlay */}
      <div className="scene__vignette" />

      {/* dreamy haze near horizon */}
      <div className="scene__haze" />

      {/* wind lines drifting across grass */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`wind-${i}`}
          className="scene__wind"
          style={{ top: `${55 + i * 6}%`, "--wind-delay": `${i * 1.2}s`, "--wind-dur": `${3.5 + i * 0.6}s` }}
        />
      ))}

      {/* floating seeds / dandelions */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`seed-${i}`}
          className="scene__seed"
          style={{
            left: `${8 + i * 11}%`,
            "--seed-delay": `${i * 1.4}s`,
            "--seed-dur": `${7 + i * 1.1}s`,
            "--seed-drift": `${(i % 2 === 0 ? 1 : -1) * (20 + i * 8)}px`,
          }}
        />
      ))}

      <div className="scene__books">
        {phase === "ready" && books.length > 0 ? (
          books.map((b) => (
            <Book
              key={b.type}
              type={b.type}
              place={b.place}
              dropDelay={DROP_ORDER[b.type] * DROP_STAGGER}
              onOpen={() => onOpenBook(b.type)}
              onPlayOpenSfx={onPlayOpenSfx}
              onPlayDropSfx={onPlayDropSfx}
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
