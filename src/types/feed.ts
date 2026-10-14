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
  avatar_path: string | null;
};

export type FeedCatchWithImage = FeedCatch & {
  imageUrl: string | null;
};
