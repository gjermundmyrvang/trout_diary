export type Profile = {
  id: string;
  username: string;
  avatar_path: string | null;
};

export type ProfileUpdates = {
  username?: string;
  avatarPath?: string | null;
};
