import { supabase } from "@/supabase/client";

export type FeedCatch = {
  id: string;
  trout_type: string;
  username: string;
  scientific_name: string | null;
  image_path: string | null;
  weight_grams: number | null;
  length_cm: number | null;
  location_name: string | null;
  description: string | null;
  visibility: "private" | "friends";
  caught_at: string;
};

export type FeedCatchWithImage = FeedCatch & {
  imageUrl: string | null;
};

export async function getFeedCatches() {
  const { data, error } = await supabase.rpc("get_feed_catches");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
