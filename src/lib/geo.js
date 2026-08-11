/* ══════════════════════════════════════════════════════
   Nominatim (OpenStreetMap) 経由の地名解決
══════════════════════════════════════════════════════ */

function addressToPlaceInfo(address, lat, lng) {
  const country = address.country_code?.toLowerCase() || "xx";
  const prefecture = address.state || address.province || "";
  const city =
    address.city || address.town || address.village || address.county || address.state_district || "不明な場所";

  // 保存キーは市区町村名ベースで固定する（緯度経度だと、地元(検索結果の代表点)と
  // 現在地(GPS実測値)が同じ市でも一致しないため、市町村の同一判定に使えなかった）
  const cityKey = `${country}|${prefecture}|${city}`;

  return { country, prefecture, city, cityKey, lat, lng };
}

// 現在地の緯度経度 → 市町村情報（逆ジオコーディング）
export async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ja`
  );
  if (!res.ok) throw new Error("reverse geocode failed");
  const data = await res.json();
  return addressToPlaceInfo(data.address || {}, lat, lng);
}

// 地元の検索（地名 → 候補一覧）
export async function searchCity(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&addressdetails=1&accept-language=ja&limit=6`
  );
  if (!res.ok) throw new Error("city search failed");
  const results = await res.json();

  return results.map((r) => {
    const info = addressToPlaceInfo(r.address || {}, r.lat, r.lon);
    return { ...info, displayName: r.display_name };
  });
}

export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("no-geolocation"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 12000,
      maximumAge: 60000,
    });
  });
}
