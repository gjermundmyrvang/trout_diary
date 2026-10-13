import { supabase } from "@/supabase/client";

export type FriendshipStatus = "pending" | "accepted";

export type Friendship = {
  profile_id: string;
  username: string | null;
  avatar_path: string | null;
  friendship_id: string;
  friendship_status: FriendshipStatus;
  requested_by: string;
  created_at: string;
  accepted_at: string | null;
};

export type FriendSearchResult = {
  id: string;
  username: string;
  avatar_path: string | null;
  friendship_status: FriendshipStatus | null;
  requested_by: string | null;
};

export type FriendRequest = {
  friendship_id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_path: string | null;
  requested_at: string;
};

export async function fetchFriendSearchResults(query: string) {
  const { data, error } = await supabase.rpc("search_friends", {
    p_query: query,
    p_limit: 20,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function sendFriendRequest(userId: string) {
  const { error } = await supabase.rpc("manage_friendship", {
    p_action: "request",
    p_target_user_id: userId,
  });

  if (error) {
    console.error("Could not send friend request:", error.message);
    return;
  }
}

export async function handleAcceptRequest(requesterId: string) {
  const { error } = await supabase.rpc("manage_friendship", {
    p_action: "accept",
    p_target_user_id: requesterId,
  });

  if (error) {
    console.error("Could not accept request:", error);
    return;
  }
}

export async function getFriendRequest() {
  const { data, error } = await supabase.rpc("get_incoming_friend_requests");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getFriends() {
  const { data, error } = await supabase.rpc("get_my_friendships");

  if (error) throw new Error(error.message);

  const friendships: Friendship[] = data ?? [];

  return friendships;
}

export async function handleDeleteFriend(friendshipId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be signed in to remove a friend.");

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", friendshipId);

  if (error) throw new Error(error.message);
}
