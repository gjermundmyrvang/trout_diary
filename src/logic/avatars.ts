import { supabase } from "@/supabase/client";

const AVATARS_BUCKET = "avatars";

export async function uploadAvatar(
  userId: string,
  localUri: string,
): Promise<string> {
  const extension = getFileExtension(localUri);
  const path = `${userId}/avatar-${Date.now()}.${extension}`;

  const response = await fetch(localUri);
  const fileBody = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, fileBody, {
      contentType: getContentType(extension),
      upsert: false,
    });

  if (error) {
    throw new Error(`Could not upload avatar: ${error.message}`);
  }

  return path;
}

export async function getAvatarUrl(
  avatarPath: string | null,
): Promise<string | null> {
  if (!avatarPath) {
    return null;
  }
  const { data, error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .createSignedUrl(avatarPath, 60 * 60);

  if (error) {
    console.warn("Could not load avatar URL:", error.message);
    return null;
  }

  if (!data?.signedUrl) {
    throw new Error("Supabase did not return a signed avatar URL.");
  }

  return data.signedUrl;
}

export async function deleteAvatar(avatarPath: string) {
  const { error } = await supabase.storage
    .from(AVATARS_BUCKET)
    .remove([avatarPath]);

  if (error) {
    console.warn("Could not delete old avatar:", error.message);
  }
}

function getFileExtension(uri: string): string {
  const filename = uri.split("?")[0].split("/").pop();
  const extension = filename?.split(".").pop()?.toLowerCase();

  if (extension === "png" || extension === "webp") {
    return extension;
  }

  return "jpg";
}

function getContentType(extension: string): string {
  switch (extension) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}
