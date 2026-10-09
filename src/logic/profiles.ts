import { supabase } from "@/supabase/client";
import { deleteAvatar, uploadAvatar } from "./avatars";
import { deleteAllCatchImages } from "./catchImages";

export type Profile = {
  id: string;
  username: string;
  avatar_path: string | null;
};

export type ProfileUpdates = {
  username?: string;
  avatarPath?: string | null;
};

export async function getMyProfile(): Promise<Profile> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_path")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateUserName(username: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username: username.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateAvatarPath(
  avatarPath: string,
  oldAvatarPath: string | null,
) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in.");
  }

  const newAvatarPath = await uploadAvatar(user.id, avatarPath);

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_path: newAvatarPath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    await deleteAvatar(newAvatarPath);
    throw new Error(error.message);
  }

  if (oldAvatarPath && oldAvatarPath !== newAvatarPath) {
    await deleteAvatar(oldAvatarPath);
  }

  return newAvatarPath;
}

export async function updateProfileWithPassword(password: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in.");
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteMyAccount(avatarPath: string | null) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in.");
  }
  if (avatarPath) {
    await deleteAvatar(avatarPath);
  }
  await deleteAllCatchImages(user.id);

  const { error } = await supabase.rpc("delete_my_account");

  if (error) {
    throw new Error(error.message);
  }

  // Clears the session stored locally by the Expo app.
  await signOut();
}
