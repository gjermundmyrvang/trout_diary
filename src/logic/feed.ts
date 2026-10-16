import { supabase } from "@/supabase/client";

export async function getFeedCatches() {
  const { data, error } = await supabase.rpc("get_feed_catches");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getUserCatches() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be signed in");

  const pageSize = 500;
  const catches = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("catches")
      .select("*")
      .eq("user_id", user.id)
      .order("caught_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    catches.push(...data);

    if (data.length < pageSize) break;
  }

  return catches;
}

export async function getFeedCatchById(catchId: string) {
  const { data, error } = await supabase
    .from("catches")
    .select("*, profile:profiles!catches_user_id_fkey(username)")
    .eq("id", catchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const { profile, ...catchData } = data;

  return {
    ...catchData,
    username: profile?.username ?? null,
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireAcceptedFriend(friendId: string) {
  if (!UUID_RE.test(friendId)) {
    throw new Error("Invalid friend ID");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be signed in");
  if (user.id === friendId) throw new Error("This ID belongs to you");

  const { data, error } = await supabase
    .from("friendships")
    .select("id")
    .eq("status", "accepted")
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`,
    )
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Accepted friendship not found");

  return user.id;
}

export async function getFriendCatches(friendId: string) {
  await requireAcceptedFriend(friendId);

  const pageSize = 500;
  const catches = [];

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("catches")
      .select("*")
      .eq("user_id", friendId)
      .eq("visibility", "friends")
      .order("caught_at", { ascending: false })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    catches.push(...data);

    if (data.length < pageSize) break;
  }

  return catches;
}

export async function getFriendProfile(friendId: string) {
  await requireAcceptedFriend(friendId);

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_path")
    .eq("id", friendId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("Profile not found");

  return data;
}
