import { InkText } from "@/components/InkText";
import { type FishSpecies, fishSpecies } from "@/constants/fishSpecies";
import { useSpeciesSelectionStore } from "@/logic/useCatchStore";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { FlatList, Image, View } from "react-native";

const CARD_WIDTH = 300;
const CARD_HEIGHT = 400;
const CARD_GAP = 16;
const SIDE_PADDING = 16;

export default function SelectSpecies() {
  const setSpecies = useSpeciesSelectionStore((state) => state.setSpecies);

  function handleSelect(species: FishSpecies, idx: number) {
    setSpecies(species);
    router.back();
  }

  return (
    <View style={{ flex: 1, paddingTop: 24, paddingBottom: 24 }}>
      <FlatList
        data={fishSpecies}
        keyExtractor={(species) => species.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 1 }}
        contentContainerStyle={{
          paddingHorizontal: SIDE_PADDING,
          paddingVertical: 16,
          gap: CARD_GAP,
        }}
        decelerationRate="fast"
        renderItem={({ item: species, index }) => (
          <PressableScale
            onPress={() => handleSelect(species, index)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${species.commonName}`}
          >
            <View
              style={{
                height: CARD_HEIGHT / 2,
                width: CARD_WIDTH,
                margin: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={species.image}
                resizeMode="contain"
                style={{ width: "100%", height: "100%" }}
                accessibilityLabel={`Illustration of ${species.commonName}`}
              />
            </View>

            <View
              style={{
                flex: 1,
                paddingHorizontal: 16,
                paddingBottom: 16,
                gap: 5,
              }}
            >
              <InkText variant="catchName">{species.commonName}</InkText>
              <InkText
                variant="caption"
                style={{ fontStyle: "italic", opacity: 0.7 }}
              >
                {species.scientificName}
              </InkText>
            </View>
          </PressableScale>
        )}
      />
    </View>
  );
}
