import { supabase } from "@/supabase/client";
import { CreateCatchInput } from "@/types/catches";

export async function createCatch(input: CreateCatchInput) {
  const { data, error } = await supabase.rpc("create_catch", {
    p_trout_type: input.troutType,
    p_scientific_name: input.scientificName,
    p_image_path: input.imagePath ?? null,
    p_weight_grams: input.weightGrams ?? null,
    p_length_cm: input.lengthCm ?? null,
    p_location_name: input.locationName ?? null,
    p_description: input.description ?? null,
    p_visibility: input.visibility,
    p_caught_at: (input.caughtAt ?? new Date()).toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function likeCatch(catchId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in to like a catch.");
  }

  const { error } = await supabase.from("catch_likes").insert({
    catch_id: catchId,
    user_id: user.id,
  });

  if (error && error.code !== "23505") {
    // 23505 = duplicate primary key: already liked.
    throw new Error(error.message);
  }
}

export async function unlikeCatch(catchId: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in to remove a like.");
  }

  const { error } = await supabase
    .from("catch_likes")
    .delete()
    .eq("catch_id", catchId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function setCatchLiked(catchId: string, isLiked: boolean) {
  if (isLiked) {
    await unlikeCatch(catchId);
  } else {
    await likeCatch(catchId);
  }
}

export async function getCatchLikes(catchId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: likes, error } = await supabase
    .from("catch_likes")
    .select("user_id")
    .eq("catch_id", catchId);

  if (error) {
    throw new Error(error.message);
  }

  return {
    count: likes.length,
    likedByCurrentUser: user
      ? likes.some((like) => like.user_id === user.id)
      : false,
  };
}

const MAX_COMMENT_LENGTH = 500;

export async function addCatchComment(
  catchId: string,
  comment_by: string,
  text: string,
) {
  const body = text.trim();

  if (!body) {
    throw new Error("A comment cannot be empty.");
  }

  if (body.length > MAX_COMMENT_LENGTH) {
    throw new Error(
      `Comments cannot be longer than ${MAX_COMMENT_LENGTH} characters.`,
    );
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in to comment.");
  }

  const { data, error } = await supabase
    .from("catch_comments")
    .insert({
      catch_id: catchId,
      user_id: user.id,
      comment_by: comment_by,
      body,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteCatchComment(commentId: string) {
  const { error } = await supabase
    .from("catch_comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCatchComments(catchId: string) {
  const { data, error } = await supabase
    .from("catch_comments")
    .select(
      `
      id,
      body,
      created_at,
      user_id,
      comment_by
    `,
    )
    .eq("catch_id", catchId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
