import { useState } from "react";
import { searchCity } from "../lib/geo";

export default function HometownSetup({ onSelect }) {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | searching | error | picked
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus("searching");
    setErrorMsg("");
    try {
      const results = await searchCity(query.trim());
      if (results.length === 0) {
        setErrorMsg("見つかりませんでした。別のキーワードで試してください。");
        setStatus("error");
        return;
      }
      setCandidates(results);
      setStatus("idle");
    } catch {
      setErrorMsg("検索に失敗しました。通信環境をご確認ください。");
      setStatus("error");
    }
  };

  return (
    <div className="setup">
      <div className="setup__card">
        <p className="setup__eyebrow">はじめに</p>
        <h1 className="setup__title">あなたの「地元」を登録してください</h1>
        <p className="setup__desc">
          地元を登録すると、そこにいる人たちが投稿した街の魅力を読んだり、「帰省したい」と気持ちを届けたりできるようになります。
        </p>

        <form className="setup__form" onSubmit={handleSearch}>
          <input
            className="setup__input"
            type="text"
            placeholder="例）札幌市、京都府京都市、Nagasaki..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="setup__search-btn" type="submit" disabled={status === "searching"}>
            {status === "searching" ? "検索中…" : "検索"}
          </button>
        </form>

        {errorMsg && <p className="setup__error">{errorMsg}</p>}

        {candidates.length > 0 && (
          <ul className="setup__candidates">
            {candidates.map((c) => (
              <li key={c.cityKey}>
                <button className="setup__candidate-btn" onClick={() => onSelect(c)}>
                  <span className="setup__candidate-city">{c.city}</span>
                  <span className="setup__candidate-full">{c.displayName}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
