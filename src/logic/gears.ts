import { supabase } from "@/supabase/client";
import { GearSet, NewGearSet } from "@/types/gear";

export async function getUserGearSets(): Promise<GearSet[]> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be signed in to get gear sets.");

  const { data, error } = await supabase
    .from("gear_sets")
    .select("id, user_id, name, rod, reel, line, notes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function getGearSetById(
  gearSetId: string,
): Promise<GearSet | null> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be signed in to get gear sets.");

  const { data, error } = await supabase
    .from("gear_sets")
    .select("id, user_id, name, rod, reel, line, notes, created_at")
    .eq("id", gearSetId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function addGearSet(gearSet: NewGearSet): Promise<GearSet> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be signed in to get gear sets.");

  const { data, error } = await supabase
    .from("gear_sets")
    .insert({ ...gearSet, user_id: user.id })
    .select("id, user_id, name, rod, reel, line, notes, created_at")
    .single();

  if (error) throw error;

  return data;
}

type GearSetUpdate = Partial<
  Pick<GearSet, "name" | "rod" | "reel" | "line" | "notes">
>;

export async function updateGearSet(
  gearSetId: string,
  updates: GearSetUpdate,
): Promise<GearSet> {
  if (Object.keys(updates).length === 0) {
    throw new Error("Provide at least one field to update.");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be signed in to get gear sets.");

  const { data, error } = await supabase
    .from("gear_sets")
    .update(updates)
    .eq("id", gearSetId)
    .eq("user_id", user.id)
    .select("id, user_id, name, rod, reel, line, notes, created_at")
    .maybeSingle();

  if (error) throw error;
  if (!data)
    throw new Error(
      "Gear set not found or you do not have permission to update it.",
    );

  return data;
}

export async function deleteGearSet(gearSetId: string): Promise<void> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("You must be signed in to get gear sets.");

  const { data, error } = await supabase
    .from("gear_sets")
    .delete()
    .eq("id", gearSetId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data)
    throw new Error(
      "Gear set not found or you do not have permission to delete it.",
    );
}
