import { supabase } from "./supabaseClient";

// GPS/検索で得た地名情報から places レコードを作成 or 取得
export async function getOrCreatePlace(placeInfo) {
  const { cityKey, city, prefecture, country, lat, lng } = placeInfo;

  const { error: upsertError } = await supabase.from("places").upsert(
    { city_key: cityKey, city, prefecture, country, lat, lng },
    { onConflict: "city_key", ignoreDuplicates: true }
  );
  if (upsertError) throw upsertError;

  const { data, error: fetchError } = await supabase
    .from("places")
    .select("*")
    .eq("city_key", cityKey)
    .single();
  if (fetchError) throw fetchError;
  if (!data?.id) throw new Error("No place id returned");

  return data;
}

export async function fetchCharms(placeId) {
  const { data, error } = await supabase
    .from("charms")
    .select("*")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addCharm(placeId, content) {
  const { data, error } = await supabase
    .from("charms")
    .insert({ place_id: placeId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function likeCharm(charmId) {
  const { error } = await supabase.rpc("increment_likes", { charm_id: charmId });
  if (error) throw error;
}

export async function voteKaisei(placeId) {
  const { error } = await supabase.rpc("increment_kaisei", { target_place_id: placeId });
  if (error) throw error;
}

export async function fetchRanking(limit = 20) {
  const { data, error } = await supabase
    .from("places")
    .select("*")
    .gt("kaisei_count", 0)
    .order("kaisei_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
