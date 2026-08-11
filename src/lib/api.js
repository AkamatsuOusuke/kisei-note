import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebaseClient";

// GPS/検索で得た地名情報から places ドキュメントを作成 or 取得
// ドキュメントID = cityKey（緯度経度＋国コードで一意）
export async function getOrCreatePlace(placeInfo) {
  const { cityKey, city, prefecture, country, lat, lng } = placeInfo;
  const ref = doc(db, "places", cityKey);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      city,
      prefecture,
      country,
      lat,
      lng,
      kaisei_count: 0,
      created_at: serverTimestamp(),
    });
    return { id: cityKey, city_key: cityKey, city, prefecture, country, lat, lng, kaisei_count: 0 };
  }

  const data = snap.data();
  return { id: snap.id, city_key: snap.id, ...data };
}

export async function fetchCharms(placeId) {
  const q = query(collection(db, "places", placeId, "charms"), orderBy("created_at", "desc"));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addCharm(placeId, content) {
  const ref = await addDoc(collection(db, "places", placeId, "charms"), {
    content,
    likes_count: 0,
    created_at: serverTimestamp(),
  });
  return { id: ref.id, content, likes_count: 0, created_at: new Date().toISOString() };
}

export async function likeCharm(placeId, charmId) {
  await updateDoc(doc(db, "places", placeId, "charms", charmId), {
    likes_count: increment(1),
  });
}

export async function voteKaisei(placeId) {
  await updateDoc(doc(db, "places", placeId), {
    kaisei_count: increment(1),
  });
}

export async function fetchRanking(limitCount = 20) {
  const q = query(
    collection(db, "places"),
    where("kaisei_count", ">", 0),
    orderBy("kaisei_count", "desc"),
    limit(limitCount)
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
}
