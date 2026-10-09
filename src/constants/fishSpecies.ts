export const fishSpecies = [
  {
    id: "brown-trout",
    commonName: "Brown trout",
    scientificName: "Salmo trutta",
    image: require("@/assets/fish/brown-trout.png"),
  },
  {
    id: "rainbow-trout",
    commonName: "Rainbow trout",
    scientificName: "Oncorhynchus mykiss",
    image: require("@/assets/fish/rainbow-trout.png"),
  },
  {
    id: "arctic-char",
    commonName: "Arctic char",
    scientificName: "Salvelinus alpinus",
    image: require("@/assets/fish/arctic-char.png"),
  },
  {
    id: "brook-trout",
    commonName: "Brook trout",
    scientificName: "Salvelinus fontinalis",
    image: require("@/assets/fish/brook-trout.png"),
  },
  {
    id: "lake-trout",
    commonName: "Lake trout",
    scientificName: "Salvelinus namaycush",
    image: require("@/assets/fish/lake-trout.png"),
  },
  {
    id: "bull-trout",
    commonName: "Bull Trout",
    scientificName: "Salvelinus confluentus",
    image: require("@/assets/fish/bull-trout.png"),
  },
  {
    id: "cutthroat-trout",
    commonName: "Cutthroat Trout",
    scientificName: "Oncorhynchus clarkii",
    image: require("@/assets/fish/cutthrout-trout.png"),
  },
  {
    id: "golden-trout",
    commonName: "Golden Trout",
    scientificName: "Oncorhynchus aguabonita",
    image: require("@/assets/fish/golden-trout.png"),
  },
  {
    id: "sea-trout",
    commonName: "Sea trout",
    scientificName: "Salmo trutta trutta",
    image: require("@/assets/fish/sea-trout.png"),
  },
] as const;

export type FishSpecies = (typeof fishSpecies)[number];
export type FishSpeciesId = FishSpecies["id"];
