import { fishSpecies, type FishSpecies } from "@/constants/fishSpecies";
import { typography } from "@/constants/typography";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

type SpeciesPickerProps = {
  selectedSpeciesId?: FishSpecies["id"];
  onSelect: (species: FishSpecies) => void;
};

export function SpeciesPicker({
  selectedSpeciesId,
  onSelect,
}: SpeciesPickerProps) {
  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
    >
      {fishSpecies.map((species) => {
        const selected = species.id === selectedSpeciesId;

        return (
          <Pressable
            key={species.id}
            onPress={() => onSelect(species)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${species.commonName}`}
            accessibilityState={{ selected }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 16,
              minHeight: 112,
              padding: 12,
              borderWidth: selected ? 2 : 1,
              borderColor: "#111111",
              backgroundColor: selected ? "#F0EEE8" : "#FFFFFF",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Image
              source={species.image}
              resizeMode="contain"
              style={{
                width: 112,
                height: 80,
              }}
            />

            <View style={{ flex: 1, gap: 4 }}>
              <Text style={typography.catchName}>{species.commonName}</Text>

              <Text style={typography.caption}>{species.scientificName}</Text>

              {selected && (
                <Text style={typography.sectionLabel}>SELECTED</Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
