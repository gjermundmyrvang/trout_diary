import { FishSpecies } from "./fish";

export type CatchVisibility = "private" | "friends";

export type CreateCatchInput = {
  troutType: string;
  scientificName: string;
  imagePath: string | null;
  weightGrams?: number | null;
  lengthCm?: number | null;
  locationName?: string | null;
  description?: string | null;
  visibility: CatchVisibility;
  caughtAt?: Date;
  gearSetId: string | null;
  lureOrFly: string | null;
  lureOrFlyType: "lure" | "fly" | "bait" | "other" | null;
};

export type CatchDraft = {
  species: FishSpecies | null;
};

export type Comment = {
  id: string;
  body: string;
  user_id: string;
  comment_by: string;
  comment_avatar: string | null;
};
