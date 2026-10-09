import { FishSpecies } from "@/constants/fishSpecies";

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
};

export type CatchDraft = {
  species: FishSpecies | null;
};
