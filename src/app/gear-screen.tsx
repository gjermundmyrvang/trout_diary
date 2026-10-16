import Field from "@/components/Field";
import { InkText } from "@/components/InkText";
import { addGearSet, getGearSetById, updateGearSet } from "@/logic/gears";
import { router, useLocalSearchParams } from "expo-router";
import { PressableScale } from "pressto";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function GearScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [isLoading, setIsLoading] = useState(Boolean(id));

  const [name, setName] = useState("");
  const [rod, setRod] = useState("");
  const [reel, setReel] = useState("");
  const [line, setLine] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(id);

  useEffect(() => {
    async function loadGearSet() {
      if (!id) {
        return;
      }

      try {
        setIsLoading(true);

        const loadedGearSet = await getGearSetById(id);

        if (!loadedGearSet) {
          Alert.alert("Gear set not found");
          router.back();
          return;
        }

        // A null database value becomes an empty field in the form.
        setName(loadedGearSet.name);
        setRod(loadedGearSet.rod ?? "");
        setReel(loadedGearSet.reel ?? "");
        setLine(loadedGearSet.line ?? "");
        setNotes(loadedGearSet.notes ?? "");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load gear set.";

        Alert.alert("Could not load gear set", message);
      } finally {
        setIsLoading(false);
      }
    }

    void loadGearSet();
  }, [id]);

  async function handleSave() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert("Name required", "Give your gear set a name.");
      return;
    }

    try {
      setIsSaving(true);

      const values = {
        name: trimmedName,
        rod: rod.trim() || null,
        reel: reel.trim() || null,
        line: line.trim() || null,
        notes: notes.trim() || null,
      };

      if (id) {
        await updateGearSet(id, values);
      } else {
        await addGearSet(values);
      }

      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save gear set.";

      Alert.alert("Could not save gear set", message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View
        style={{ height: 500, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={24}
      contentContainerStyle={{
        flexGrow: 1,
        padding: 16,
        paddingBottom: 32,
      }}
    >
      <View style={{ gap: 20 }}>
        <View style={{ gap: 6 }}>
          <InkText variant="screenTitle">ADD GEAR SET</InkText>

          <InkText variant="caption" style={{ opacity: 0.65 }}>
            Save your usual rod, reel, and line combination for quick use when
            registering a catch.
          </InkText>
        </View>

        <View style={{ gap: 12 }}>
          <Field
            label="SET NAME*"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Deep water setup"
          />

          <Field
            label="ROD"
            value={rod}
            onChangeText={setRod}
            placeholder="e.g. Shimano Beastmaster 7'"
          />

          <Field
            label="REEL"
            value={reel}
            onChangeText={setReel}
            placeholder="e.g. Shimano Sedona 2500"
          />

          <Field
            label="LINE"
            value={line}
            onChangeText={setLine}
            placeholder="e.g. 0.18 mm braided line"
          />

          <Field
            label="NOTES (optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Best for lakes and deeper water"
            multiline
          />
        </View>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <PressableScale
            onPress={() => router.back()}
            disabled={isSaving}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#000000",
              padding: 16,
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            <InkText variant="button">CANCEL</InkText>
          </PressableScale>

          <PressableScale
            onPress={handleSave}
            disabled={isSaving || !name.trim()}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#000000",
              padding: 16,
              opacity: isSaving || !name.trim() ? 0.5 : 1,
            }}
          >
            <InkText variant="button" style={{ color: "#FFFFFF" }}>
              {isSaving ? "SAVING..." : isEditing ? "UPDATE SET" : "SAVE SET"}
            </InkText>
          </PressableScale>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
