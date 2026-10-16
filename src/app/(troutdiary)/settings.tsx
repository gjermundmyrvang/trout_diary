import Field from "@/components/Field";
import GearSetCard from "@/components/GearSetCard";
import { InkText } from "@/components/InkText";
import { getUserGearSets } from "@/logic/gears";
import {
  deleteMyAccount,
  updateProfileWithPassword,
  updateUserName,
} from "@/logic/profiles";
import { useSession } from "@/providers/AuthProvider";
import { GearSet } from "@/types/gear";
import { router, useFocusEffect } from "expo-router";
import { PressableScale } from "pressto";
import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function Settings() {
  const { signOut, profile } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [gearSets, setGearSets] = useState<GearSet[]>([]);

  const normalizedUsername = username.trim();

  const usernameChanged =
    profile !== null && normalizedUsername !== profile.username.trim();

  const passwordChanged = password.length > 0;

  const hasUnsavedChanges = usernameChanged || passwordChanged;

  async function loadGearSets() {
    const gearSets = await getUserGearSets();
    setGearSets(gearSets);
  }

  useFocusEffect(
    useCallback(() => {
      void loadGearSets();
    }, []),
  );

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  function handleAddGearSet() {
    router.push("/gear-screen");
  }

  async function handleSave() {
    if (!profile || !hasUnsavedChanges) {
      return;
    }
    try {
      setIsSaving(true);
      let changes = [];
      if (usernameChanged) {
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
          Alert.alert(
            "Invalid username",
            "Use 3–30 letters, numbers, or underscores.",
          );
          return;
        }
        await updateUserName(normalizedUsername);
        setUsername(normalizedUsername);
        changes.push("Username");
      }
      if (passwordChanged) {
        await updateProfileWithPassword(password);
        setPassword("");
        changes.push("Password");
      }
      Alert.alert("Profile saved", `Changes saved: ${changes.join(", ")}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save profile.";

      Alert.alert("Could not save profile", message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSignOut() {
    Alert.alert(
      "Sign Out",
      "Please confirm you want to sign out of the application",
      [
        { text: "Sign Out", onPress: signOut, style: "destructive" },
        { text: "Cancel", style: "cancel" },
      ],
    );
  }

  async function handleDeleteAccount() {
    if (!profile) return;
    Alert.alert(
      "Delete account?",
      "This permanently deletes your account and associated data. This cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete account",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMyAccount(profile.avatar_path);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not delete your account.";

              Alert.alert("Could not delete account", message);
            }
          },
        },
      ],
    );
  }
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={30}
      contentContainerStyle={{
        gap: 20,
        paddingBottom: 20,
        paddingHorizontal: 8,
      }}
    >
      <View style={{ paddingHorizontal: 8 }}>
        <InkText variant="screenTitle">SETTINGS</InkText>
        <View style={{ marginVertical: 20, gap: 6 }}>
          <InkText variant="measurement">PROFILE</InkText>
          <Field
            label="USERNAME"
            value={username}
            onChangeText={setUsername}
            placeholder="your_username"
          />

          <Field
            label="SET/CHANGE PASSWORD (optional)"
            value={password}
            onChangeText={setPassword}
            placeholder="your_password"
            password={true}
          />

          {hasUnsavedChanges && (
            <InkText variant="button" style={{ color: "#3f76ff" }}>
              Changes detected, press save to update your profile.
            </InkText>
          )}

          <PressableScale
            onPress={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            style={{
              alignItems: "center",
              backgroundColor: "#000000",
              opacity: isSaving || !hasUnsavedChanges ? 0.5 : 1,
              padding: 16,
              marginTop: 6,
            }}
          >
            <InkText variant="button" style={{ color: "#FFFFFF" }}>
              {isSaving ? "SAVING..." : "SAVE PROFILE"}
            </InkText>
          </PressableScale>
        </View>

        <View style={{ marginVertical: 20, gap: 10 }}>
          <InkText variant="measurement">GEAR</InkText>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <PressableScale
              onPress={handleAddGearSet}
              accessibilityRole="button"
              accessibilityLabel="Add gear set"
              style={{
                width: "30%",
                minHeight: 130,
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: 10,
                borderWidth: 1.5,
                borderStyle: "dashed",
                borderColor: "#000000",
                backgroundColor: "#e6e6e6",
              }}
            >
              <InkText
                variant="screenTitle"
                style={{
                  color: "#000",
                  fontSize: 32,
                  lineHeight: 36,
                }}
              >
                +
              </InkText>

              <InkText
                variant="caption"
                style={{
                  color: "#000",
                  textAlign: "center",
                }}
              >
                ADD GEAR SET
              </InkText>
            </PressableScale>

            {gearSets.map((gearSet) => (
              <GearSetCard
                key={gearSet.id}
                gearSet={gearSet}
                onPress={() => {
                  router.navigate({
                    pathname: "/gear-screen",
                    params: {
                      id: gearSet.id,
                    },
                  });
                }}
              />
            ))}
          </View>

          {gearSets.length === 0 && (
            <InkText variant="caption" style={{ opacity: 0.65 }}>
              Add a rod, reel, and line setup to use when registering catches.
            </InkText>
          )}
        </View>

        <View style={{ marginVertical: 20, gap: 6 }}>
          <InkText variant="measurement">ACCOUNT</InkText>
          <PressableScale
            onPress={handleSignOut}
            style={{
              alignItems: "center",
              backgroundColor: "#00815a",
              padding: 16,
            }}
          >
            <InkText variant="button">SIGN OUT</InkText>
          </PressableScale>
          <PressableScale
            onPress={handleDeleteAccount}
            style={{
              alignItems: "center",
              backgroundColor: "#df0000",
              padding: 16,
            }}
          >
            <InkText variant="button">DELETE MY ACCOUNT</InkText>
          </PressableScale>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
