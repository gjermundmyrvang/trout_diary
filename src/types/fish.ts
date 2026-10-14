import { fishSpecies } from "@/constants/fishSpecies";

export type FishSpecies = (typeof fishSpecies)[number];
export type FishSpeciesId = FishSpecies["id"];
