import { supabase } from "@/supabase/client";
import * as Crypto from "expo-crypto";

const BUCKET = "catch-images";

export async function uploadCatchImage(
  userId: string,
  localUri: string,
): Promise<string> {
  const extension = getFileExtension(localUri);
  const path = `${userId}/${Crypto.randomUUID()}.${extension}`;

  // Expo supports reading the local selected file through fetch.
  const response = await fetch(localUri);
  const fileBody = await response.arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, fileBody, {
    contentType: getContentType(extension),
    upsert: false,
  });

  if (error) {
    throw new Error(`Could not upload catch photo: ${error.message}`);
  }

  return path;
}

export async function deleteAllCatchImages(userId: string) {
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(userId);

  if (listError) {
    throw new Error(`Could not list catch images: ${listError.message}`);
  }

  if (!files || files.length === 0) {
    return;
  }

  const paths = files.map((file) => `${userId}/${file.name}`);

  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove(paths);

  if (removeError) {
    throw new Error(`Could not delete catch images: ${removeError.message}`);
  }
}

export async function deleteCatchImage(path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    console.warn("Could not remove uploaded catch image:", error.message);
  }
}

function getFileExtension(uri: string): string {
  const filename = uri.split("?")[0].split("/").pop();
  const extension = filename?.split(".").pop()?.toLowerCase();

  return extension === "png" || extension === "webp" ? extension : "jpg";
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

export async function getCatchImageUrl(
  imagePath: string | null,
): Promise<string | null> {
  if (!imagePath) {
    return null;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(imagePath, 60 * 60);

  if (error) {
    console.warn("Could not create signed image URL:", error.message);
    return null;
  }

  return data.signedUrl;
}
