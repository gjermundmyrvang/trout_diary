import { supabase } from "@/supabase/client";

export async function getFeedCatches() {
  const { data, error } = await supabase.rpc("get_feed_catches");

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getFeedCatchById(catchId: string) {
  const { data, error } = await supabase
    .from("catches")
    .select("*")
    .eq("id", catchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
