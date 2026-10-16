import { fishSpecies } from "@/constants/fishSpecies";
import { ImageSourcePropType } from "react-native";

export const defaultFishIllustration = require("@/assets/fish/brown-trout.png");

export function getFishIllustration(troutType: string): ImageSourcePropType {
  const species = fishSpecies.find(
    (species) => species.commonName === troutType,
  );

  return species?.image ?? defaultFishIllustration;
}

export function formatCaughtAt(caughtAt: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(caughtAt));
}
