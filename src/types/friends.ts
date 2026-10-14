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
