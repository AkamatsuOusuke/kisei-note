/* ══════════════════════════════════════════════════════
   ローカル保存（地元の登録情報 / 二重投票・二重いいねの防止）
══════════════════════════════════════════════════════ */

const HOMETOWN_KEY = "kisei_hometown_v1";
const VOTED_CITIES_KEY = "kisei_voted_cities_v1";
const LIKED_CHARMS_KEY = "kisei_liked_charms_v1";

export function loadHometown() {
  try {
    const raw = localStorage.getItem(HOMETOWN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveHometown(place) {
  try {
    localStorage.setItem(HOMETOWN_KEY, JSON.stringify(place));
  } catch {
    /* noop */
  }
}

export function clearHometown() {
  try {
    localStorage.removeItem(HOMETOWN_KEY);
  } catch {
    /* noop */
  }
}

function loadIdSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveIdSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    /* noop */
  }
}

export function hasVotedKaisei(cityKey) {
  return loadIdSet(VOTED_CITIES_KEY).has(cityKey);
}

export function markVotedKaisei(cityKey) {
  const set = loadIdSet(VOTED_CITIES_KEY);
  set.add(cityKey);
  saveIdSet(VOTED_CITIES_KEY, set);
}

export function hasLikedCharm(charmId) {
  return loadIdSet(LIKED_CHARMS_KEY).has(charmId);
}

export function markLikedCharm(charmId) {
  const set = loadIdSet(LIKED_CHARMS_KEY);
  set.add(charmId);
  saveIdSet(LIKED_CHARMS_KEY, set);
}
