import Field from "@/components/Field";
import { InkText } from "@/components/InkText";
import { typography } from "@/constants/typography";
import { createCatch } from "@/logic/catches";
import { deleteCatchImage, uploadCatchImage } from "@/logic/catchImages";
import { useSpeciesSelectionStore } from "@/logic/useCatchStore";
import { useSession } from "@/providers/AuthProvider";
import { CatchVisibility } from "@/types/catches";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { useState } from "react";
import { Alert, Image, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function CatchScreen() {
  const { user } = useSession();
  const species = useSpeciesSelectionStore((state) => state.species);
  const reset = useSpeciesSelectionStore((state) => state.resetSpecies);

  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<CatchVisibility>("friends");
  const [isSaving, setIsSaving] = useState(false);

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function handlePickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo permission needed",
        "Allow photo access to add a picture of your catch.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  const handleSave = async () => {
    const parsedWeight = weight ? Number(weight) : null;
    const parsedLength = length ? Number(length) : null;

    if (!species?.commonName.trim()) {
      Alert.alert("Missing trout type", "Enter the type of trout.");
      return;
    }

    if (
      parsedWeight !== null &&
      (!Number.isFinite(parsedWeight) || parsedWeight <= 0)
    ) {
      Alert.alert(
        "Invalid weight",
        "Weight must be a positive number of grams.",
      );
      return;
    }

    if (
      parsedLength !== null &&
      (!Number.isFinite(parsedLength) || parsedLength <= 0)
    ) {
      Alert.alert("Invalid length", "Length must be a positive number in cm.");
      return;
    }

    try {
      setIsSaving(true);

      if (!user) {
        throw new Error("You must be signed in to save a catch.");
      }
      let imagePath: string | null = null;

      if (photoUri) {
        imagePath = await uploadCatchImage(user.id, photoUri);
      }

      try {
        await createCatch({
          troutType: species?.commonName,
          scientificName: species?.scientificName,
          imagePath,
          weightGrams: parsedWeight,
          lengthCm: parsedLength,
          locationName,
          description,
          visibility,
        });
      } catch (error) {
        if (imagePath) {
          await deleteCatchImage(imagePath);
        }

        throw error;
      }

      setWeight("");
      setLength("");
      setLocationName("");
      setDescription("");
      setVisibility("friends");

      reset();

      Alert.alert("Catch saved", "Your trout has been added to the diary.", [
        {
          text: "Sweet",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save the catch.";

      Alert.alert("Could not save catch", message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      mode="insets"
      bottomOffset={30}
      contentContainerStyle={{
        paddingTop: 80,
        padding: 24,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <InkText variant="screenTitle">NEW CATCH</InkText>
        <PressableScale onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} />
        </PressableScale>
      </View>

      <InkText style={typography.sectionLabel}>SELECT SPECIES</InkText>
      <PressableScale
        onPress={() => router.push("/select-species")}
        accessibilityRole="button"
        accessibilityLabel="Choose fish species"
        style={{
          borderColor: "#111111",
          borderWidth: 1,
          padding: 14,
          gap: 4,
        }}
      >
        {species ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <InkText style={typography.catchName}>
                {species?.commonName}
              </InkText>

              <InkText style={typography.caption}>
                {species?.scientificName}
              </InkText>
            </View>
            <Image
              source={species.image}
              resizeMode="contain"
              style={{ width: 100, height: 50 }}
              accessibilityLabel={`Illustration of ${species.commonName}`}
            />
          </View>
        ) : (
          <InkText style={typography.caption}>Select species</InkText>
        )}
      </PressableScale>

      <InkText variant="sectionLabel">CATCH PHOTO</InkText>

      <PressableScale
        onPress={handlePickPhoto}
        accessibilityRole="button"
        accessibilityLabel={
          photoUri ? "Change catch photo" : "Add a photo of your catch"
        }
        style={{
          height: 180,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: photoUri ? "transparent" : "#ccc",
          backgroundColor: "#fafafa",
        }}
      >
        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            resizeMode="cover"
            style={{
              width: "100%",
              height: "100%",
            }}
            accessibilityLabel="Selected catch photo"
          />
        ) : (
          <View style={{ alignItems: "center", gap: 8 }}>
            <Ionicons name="camera-outline" size={42} />
            <InkText variant="caption">ADD A PHOTO</InkText>
          </View>
        )}
      </PressableScale>

      {photoUri && (
        <PressableScale
          onPress={() => setPhotoUri(null)}
          accessibilityRole="button"
          accessibilityLabel="Remove selected catch photo"
          style={{ alignSelf: "flex-end" }}
        >
          <InkText variant="caption">REMOVE PHOTO</InkText>
        </PressableScale>
      )}

      <Field
        label="WEIGHT (GRAMS)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="number-pad"
        placeholder="420"
      />

      <Field
        label="LENGTH (CM)"
        value={length}
        onChangeText={setLength}
        keyboardType="decimal-pad"
        placeholder="31"
      />

      <Field
        label="LOCATION"
        value={locationName}
        onChangeText={setLocationName}
        placeholder="Nordmarka"
      />

      <Field
        label="DIARY ENTRY"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        placeholder="How was the catch?"
        minHeight={120}
        font={typography.body}
      />

      <InkText variant="sectionLabel">VISIBILITY</InkText>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <VisibilityButton
          label="FRIENDS"
          selected={visibility === "friends"}
          onPress={() => setVisibility("friends")}
        />

        <VisibilityButton
          label="PRIVATE"
          selected={visibility === "private"}
          onPress={() => setVisibility("private")}
        />
      </View>

      <PressableScale
        onPress={handleSave}
        disabled={isSaving || !species}
        style={{
          alignItems: "center",
          backgroundColor: !species ? "#ccc" : "#000",
          opacity: isSaving ? 0.5 : 1,
          padding: 16,
        }}
      >
        <InkText variant="button" style={{ color: "#fff", fontWeight: "700" }}>
          {isSaving ? "SAVING..." : "SAVE CATCH"}
        </InkText>
      </PressableScale>
    </KeyboardAwareScrollView>
  );
}

type VisibilityButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function VisibilityButton({ label, selected, onPress }: VisibilityButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      style={{
        borderColor: "#000",
        borderWidth: 1,
        backgroundColor: selected ? "#000" : "transparent",
        paddingHorizontal: 14,
        paddingVertical: 10,
      }}
    >
      <InkText variant="button" style={{ color: selected ? "#fff" : "#000" }}>
        {label}
      </InkText>
    </PressableScale>
  );
}
