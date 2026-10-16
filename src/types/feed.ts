import { GearSet } from "./gear";

export type FeedCatch = {
  id: string;
  user_id: string;
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
  avatar_path: string | null;
  gear_set_id: string | null;
  lure_or_fly: string | null;
  lure_or_fly_type: "lure" | "fly" | "bait" | "other" | null;
};

export type FeedCatchWithImage = FeedCatch & {
  imageUrl: string | null;
};

export type FeedCatchWithGear = FeedCatch & {
  gearSet: GearSet | null;
};
