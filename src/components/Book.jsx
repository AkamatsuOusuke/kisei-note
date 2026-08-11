import { useMemo, useState } from "react";
import bookImg from "../assets/本.png";

function getRandomTransform() {
  return {
    x: (Math.random() - 0.5) * 30, // -15%〜15%
    y: Math.random() * 10,
    rot: (Math.random() - 0.5) * 16, // -8〜8deg
    delay: Math.random() * 0.25,
  };
}

const LABELS = {
  hometown: "地元",
  current: "現在地",
};

export default function Book({ type, place, onOpen, onPlayOpenSfx }) {
  const [phase, setPhase] = useState("idle");
  const t = useMemo(() => getRandomTransform(), []);

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("zooming");
    setTimeout(() => {
      onPlayOpenSfx?.();
      onOpen();
      setPhase("idle");
    }, 500);
  };

  return (
    <div
      className={`book book--${phase}`}
      style={{
        "--book-x": `${t.x}%`,
        "--book-y": `${t.y}px`,
        "--book-rot": `${t.rot}deg`,
        "--appear-delay": `${t.delay}s`,
      }}
      onClick={handleClick}
    >
      <div className="book__grass-shadow" />
      <div className="book__body" style={{ backgroundImage: `url(${bookImg})` }} />
      <div className="book__label">
        <span className="book__label-badge">{LABELS[type]}</span>
        <span className="book__label-city">{place.city}</span>
      </div>
    </div>
  );
}
