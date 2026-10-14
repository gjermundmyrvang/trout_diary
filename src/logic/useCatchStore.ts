import { FishSpecies } from "@/types/fish";
import { create } from "zustand";

type SpeciesSelectionStore = {
  species: FishSpecies | null;
  setSpecies: (species: FishSpecies) => void;
  resetSpecies: () => void;
};

export const useSpeciesSelectionStore = create<SpeciesSelectionStore>(
  (set) => ({
    species: null,

    setSpecies: (species) => {
      set({ species });
    },

    resetSpecies: () => {
      set({ species: null });
    },
  }),
);
