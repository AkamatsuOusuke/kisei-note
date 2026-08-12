import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import bgmTrack from "./assets/bgm.mp3";
import sfxDrop from "./assets/sfx-drop.mp3";
import sfxOpen from "./assets/sfx-open.mp3";
import { getCurrentPosition, reverseGeocode } from "./lib/geo";
import { getOrCreatePlace, fetchCharms, addCharm, likeCharm, voteKaisei, fetchRanking } from "./lib/api";
import {
  loadHometown,
  saveHometown,
  clearHometown,
  hasVotedKaisei,
  markVotedKaisei,
  hasLikedCharm,
  markLikedCharm,
} from "./lib/storage";
import HometownSetup from "./components/HometownSetup";
import Scene from "./components/Scene";
import HometownModal from "./components/HometownModal";
import CurrentModal from "./components/CurrentModal";
import RankingModal from "./components/RankingModal";

export default function App() {
  // undefined = 読み込み中, null = 未登録
  const [hometown, setHometown] = useState(() => loadHometown());
  const [phase, setPhase] = useState("loading"); // loading | locating | ready | error
  const [errorMsg, setErrorMsg] = useState("");

  const [books, setBooks] = useState([]); // [{ type: 'hometown'|'current', place }]
  const [openType, setOpenType] = useState(null);
  const [charmsByPlace, setCharmsByPlace] = useState({});
  const [charmsLoading, setCharmsLoading] = useState(false);

  const [rankingOpen, setRankingOpen] = useState(false);
  const [ranking, setRanking] = useState([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  const [likedIds, setLikedIds] = useState(() => new Set());

  // BGM / 効果音（travel-note と同じ演出）
  const [bgmOn, setBgmOn] = useState(false);
  const bgmRef = useRef(null);
  const dropSfxRef = useRef(null);
  const openSfxRef = useRef(null);

  useEffect(() => {
    bgmRef.current = new Audio(bgmTrack);
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.35;

    dropSfxRef.current = new Audio(sfxDrop);
    dropSfxRef.current.volume = 0.2;

    openSfxRef.current = new Audio(sfxOpen);
    openSfxRef.current.volume = 0.35;

    return () => {
      bgmRef.current?.pause();
    };
  }, []);

  const toggleBgm = () => {
    if (!bgmRef.current) return;
    if (bgmOn) {
      bgmRef.current.pause();
    } else {
      bgmRef.current.play().catch(() => {});
    }
    setBgmOn((v) => !v);
  };

  const playDropSfx = useCallback(() => {
    if (!dropSfxRef.current || !bgmOn) return;
    dropSfxRef.current.currentTime = 0;
    dropSfxRef.current.play().catch(() => {});
  }, [bgmOn]);

  const playOpenSfx = useCallback(() => {
    if (!openSfxRef.current || !bgmOn) return;
    openSfxRef.current.currentTime = 0;
    openSfxRef.current.play().catch(() => {});
  }, [bgmOn]);

  const buildBooks = useCallback((hometownPlace, currentPlace) => {
    if (hometownPlace.city_key === currentPlace.city_key) {
      return [{ type: "current", place: currentPlace }];
    }
    return [
      { type: "hometown", place: hometownPlace },
      { type: "current", place: currentPlace },
    ];
  }, []);

  const locate = useCallback(async (hometownInfo) => {
    setPhase("locating");
    setErrorMsg("");
    try {
      const hometownPlace = await getOrCreatePlace(hometownInfo);

      const pos = await getCurrentPosition().catch((err) => {
        const code = err?.code;
        throw new Error(
          code === 1 ? "denied" : code === 2 ? "unavailable" : code === 3 ? "timeout" : "no-geo"
        );
      });

      const currentInfo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      const currentPlace = await getOrCreatePlace(currentInfo);

      setBooks(buildBooks(hometownPlace, currentPlace));
      setPhase("ready");
    } catch (err) {
      const messages = {
        denied: "位置情報の利用が許可されませんでした。",
        unavailable: "現在地を取得できませんでした。",
        timeout: "現在地の取得がタイムアウトしました。",
        "no-geo": "このブラウザは位置情報に対応していません。",
      };
      setErrorMsg(messages[err.message] || "地図情報の取得に失敗しました。通信環境をご確認ください。");
      setPhase("error");
    }
  }, [buildBooks]);

  useEffect(() => {
    if (!hometown) return;
    // 初回マウント直後に setPhase を同期的に呼ばないよう1tick遅らせる
    const id = setTimeout(() => locate(hometown), 0);
    return () => clearTimeout(id);
  }, [hometown, locate]);

  const handleSelectHometown = async (candidate) => {
    setHometown(candidate);
    saveHometown(candidate);
  };

  const handleChangeHometown = () => {
    clearHometown();
    setBooks([]);
    setOpenType(null);
    setHometown(null);
    setPhase("loading");
  };

  const openBook = async (type) => {
    setOpenType(type);
    const book = books.find((b) => b.type === type);
    if (!book) return;
    const placeId = book.place.id;
    setCharmsLoading(true);
    try {
      const charms = await fetchCharms(placeId);
      setCharmsByPlace((prev) => ({ ...prev, [placeId]: charms }));
      setLikedIds(new Set(charms.filter((c) => hasLikedCharm(c.id)).map((c) => c.id)));
    } finally {
      setCharmsLoading(false);
    }
  };

  const closeModal = () => setOpenType(null);

  const openBookData = books.find((b) => b.type === openType);
  const openCharms = openBookData ? charmsByPlace[openBookData.place.id] || [] : [];

  const handleSubmitCharm = async (content) => {
    if (!openBookData) return;
    const newCharm = await addCharm(openBookData.place.id, content);
    setCharmsByPlace((prev) => ({
      ...prev,
      [openBookData.place.id]: [newCharm, ...(prev[openBookData.place.id] || [])],
    }));
  };

  const handleLikeCharm = async (charmId) => {
    if (hasLikedCharm(charmId)) return;
    markLikedCharm(charmId);
    setLikedIds((prev) => new Set(prev).add(charmId));
    setCharmsByPlace((prev) => {
      if (!openBookData) return prev;
      const list = prev[openBookData.place.id] || [];
      return {
        ...prev,
        [openBookData.place.id]: list.map((c) =>
          c.id === charmId ? { ...c, likes_count: (c.likes_count ?? 0) + 1 } : c
        ),
      };
    });
    try {
      await likeCharm(charmId);
    } catch {
      /* ベストエフォート：失敗しても表示は既に更新済み */
    }
  };

  const handleVoteKaisei = async () => {
    if (!openBookData) return;
    const cityKey = openBookData.place.city_key;
    if (hasVotedKaisei(cityKey)) return;
    markVotedKaisei(cityKey);

    setBooks((prev) =>
      prev.map((b) =>
        b.place.city_key === cityKey
          ? { ...b, place: { ...b.place, kaisei_count: (b.place.kaisei_count ?? 0) + 1 } }
          : b
      )
    );

    try {
      await voteKaisei(openBookData.place.id);
    } catch {
      /* ベストエフォート */
    }
  };

  const openRanking = async () => {
    setRankingOpen(true);
    setRankingLoading(true);
    try {
      setRanking(await fetchRanking());
    } finally {
      setRankingLoading(false);
    }
  };

  if (hometown === undefined) {
    return <div className="app app--blank" />;
  }

  if (hometown === null) {
    return <HometownSetup onSelect={handleSelectHometown} />;
  }

  return (
    <div className="app">
      <div className="top-actions">
        <button className="top-actions__btn" onClick={openRanking}>🏆 ランキング</button>
        <button className="top-actions__btn" onClick={handleChangeHometown}>地元を変更</button>
        <button className="top-actions__btn bgm-toggle" onClick={toggleBgm}>{bgmOn ? "🔊 ON" : "🔇 OFF"}</button>
      </div>

      <header className="header">
        <h1 className="header__title">帰省日和</h1>
        <div className="header__divider" />
      </header>

      <Scene
        books={books}
        onOpenBook={openBook}
        onPlayOpenSfx={playOpenSfx}
        onPlayDropSfx={playDropSfx}
        phase={phase}
      />

      <footer className="footer">
        {phase === "error" && <p className="footer__error">{errorMsg}</p>}
        {phase === "ready" && <p className="footer__success">現在地: {books.find((b) => b.type === "current")?.place.city}</p>}

        <button
          className={`locate-btn ${phase === "locating" ? "locate-btn--loading" : ""}`}
          onClick={() => locate(hometown)}
          disabled={phase === "locating"}
        >
          {phase === "locating" ? "取得中…" : "現在地を更新"}
        </button>
        <p className="footer__hint">位置情報から、現在地のノートを取得します。</p>
      </footer>

      {openType === "hometown" && openBookData && (
        <HometownModal
          place={openBookData.place}
          charms={openCharms}
          loading={charmsLoading}
          alreadyVoted={hasVotedKaisei(openBookData.place.city_key)}
          likedIds={likedIds}
          onClose={closeModal}
          onVoteKaisei={handleVoteKaisei}
          onLikeCharm={handleLikeCharm}
        />
      )}

      {openType === "current" && openBookData && (
        <CurrentModal
          place={openBookData.place}
          charms={openCharms}
          loading={charmsLoading}
          onClose={closeModal}
          onSubmit={handleSubmitCharm}
        />
      )}

      {rankingOpen && (
        <RankingModal ranking={ranking} loading={rankingLoading} onClose={() => setRankingOpen(false)} />
      )}
    </div>
  );
}
