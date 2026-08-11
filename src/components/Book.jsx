import { useMemo, useState } from "react";

const PALETTES = [
  { cover: "#c8a878", spine: "#5a3a1a" },
  { cover: "#a8c880", spine: "#2a4a1a" },
  { cover: "#7ab0d8", spine: "#1a3a5a" },
  { cover: "#c87878", spine: "#5a1a1a" },
  { cover: "#c8b060", spine: "#4a3a1a" },
  { cover: "#a878c8", spine: "#3a1a4a" },
];

function getPalette(key) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) & 0xffffffff;
  return PALETTES[Math.abs(h) % PALETTES.length];
}

function getRandomTransform() {
  return {
    x: (Math.random() - 0.5) * 50,
    rot: (Math.random() - 0.5) * 14,
    delay: Math.random() * 0.3,
  };
}

const LABELS = {
  hometown: { badge: "地元", icon: "🏡" },
  current: { badge: "現在地", icon: "📍" },
};

export default function Book({ type, place, onOpen }) {
  const [phase, setPhase] = useState("idle");
  const pal = useMemo(() => getPalette(place.city_key), [place.city_key]);
  const t = useMemo(() => getRandomTransform(), []);
  const label = LABELS[type];

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("zooming");
    setTimeout(() => {
      onOpen();
      setPhase("idle");
    }, 420);
  };

  return (
    <div
      className={`book book--${phase}`}
      style={{
        "--book-x": `${t.x}%`,
        "--book-rot": `${t.rot}deg`,
        "--appear-delay": `${t.delay}s`,
        "--book-cover": pal.cover,
        "--book-spine": pal.spine,
      }}
      onClick={handleClick}
    >
      <div className="book__shadow" />
      <div className="book__body">
        <div className="book__ribbon">{label.icon}</div>
      </div>
      <div className="book__label">
        <span className="book__label-badge">{label.badge}</span>
        <span className="book__label-city">{place.city}</span>
      </div>
    </div>
  );
}
