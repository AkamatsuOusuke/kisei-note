export function formatDate(value) {
  if (!value) return "";
  // Firestore Timestamp / ISO string / Date のいずれでも扱えるようにする
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
