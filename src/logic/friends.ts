import { supabase } from "@/supabase/client";

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
