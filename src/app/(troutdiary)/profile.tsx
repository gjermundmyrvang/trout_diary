import { Avatar } from "@/components/Avatar";
import Field from "@/components/Field";
import { InkText } from "@/components/InkText";
import { Friendship, getFriends, handleDeleteFriend } from "@/logic/friends";
import {
  deleteMyAccount,
  updateAvatarPath,
  updateProfileWithPassword,
  updateUserName,
} from "@/logic/profiles";
import { useSession } from "@/providers/AuthProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { PressableScale } from "pressto";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const STATUS_COLORS = {
  accepted: "#575757",
  declined: "#bd0000",
  pending: "#6fa4e2",
};
const getFriendStatusColor = (status: "accepted" | "declined" | "pending") =>
  STATUS_COLORS[status];

export default function ProfileScreen() {
  const { signOut, profile } = useSession();

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [searchFriend, setSearchFriend] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const filteredFriends = useMemo<Friendship[]>(() => {
    const normalizedSearch = (searchFriend ?? "").toLowerCase();

    return friends.filter((item) => {
      return (item.username ?? "").toLowerCase().includes(normalizedSearch);
    });
  }, [friends, searchFriend]);

  // URI of a newly picked, local image that has not been uploaded yet.
  const [selectedAvatarUri, setSelectedAvatarUri] = useState<string | null>(
    null,
  );
  const [isSaving, setIsSaving] = useState(false);

  const normalizedUsername = username.trim();

  const usernameChanged =
    profile !== null && normalizedUsername !== profile.username.trim();

  const avatarChanged = selectedAvatarUri !== null;
  const passwordChanged = password.length > 0;

  const hasUnsavedChanges = usernameChanged || avatarChanged || passwordChanged;

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  async function loadFriends() {
    const friends = await getFriends();
    setFriends(friends);
  }

  useEffect(() => {
    loadFriends();
  }, []);

  async function handleChooseAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Photo permission needed",
        "Allow photo access to choose a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    // Avoid unnecessarily large uploads.
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert("Image too large", "Choose an image smaller than 5 MB.");
      return;
    }
    setSelectedAvatarUri(asset.uri);
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
      if (selectedAvatarUri) {
        await updateAvatarPath(
          selectedAvatarUri,
          profile.avatar_path, // Old path
        );

        setSelectedAvatarUri(null);
        changes.push("Profile picture");
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
      [{ text: "Sign Out", onPress: signOut, style: "destructive" }],
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

  async function deleteFriend(friendshipId: string, friendUsername: string) {
    Alert.alert(
      `Remove ${friendUsername} as your friend?`,
      "This permanently deletes your friendship.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete friendship",
          style: "destructive",
          onPress: async () => {
            try {
              await handleDeleteFriend(friendshipId);
              loadFriends();
              Alert.alert(`Removed ${friendUsername} as your friend`);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not delete your friendship.";

              Alert.alert("Could not delete account", message);
            }
          },
        },
      ],
    );
  }

  if (isSaving) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={30}
      contentContainerStyle={{
        flex: 1,
        gap: 20,
        padding: 24,
        paddingTop: 80,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <InkText variant="screenTitle">PROFILE</InkText>
        <PressableScale
          onPress={handleSignOut}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <InkText variant="caption" style={{ fontSize: 10 }}>
            SIGN OUT
          </InkText>
          <Ionicons name="exit" size={32} color={"#000"} />
        </PressableScale>
      </View>

      <View style={{ alignItems: "center", gap: 8 }}>
        <PressableScale
          onPress={handleChooseAvatar}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Choose profile picture"
          style={{
            width: 128,
            height: 128,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderWidth: 2,
            borderColor: "#111111",
            borderRadius: 64,
            backgroundColor: "#D9E0D2",
          }}
        >
          <Avatar
            path={profile?.avatar_path}
            localUri={selectedAvatarUri}
            username={username}
            size={124}
          />
        </PressableScale>

        <PressableScale
          onPress={handleChooseAvatar}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Choose profile picture"
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="camera-outline" size={18} />
            <InkText variant="caption">CHANGE PHOTO</InkText>
          </View>
        </PressableScale>
      </View>

      <View style={{}}>
        <InkText variant="sectionLabel">FRIENDS</InkText>
        {filteredFriends.length > 0 ? (
          <ScrollView contentContainerStyle={{ flex: 1 }} horizontal={true}>
            {filteredFriends.map((f) => (
              <View
                key={f.profile_id}
                style={{
                  marginVertical: 8,
                  paddingLeft: 8,
                  alignItems: "flex-start",
                  position: "relative",
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <Avatar
                    path={f.avatar_path}
                    size={50}
                    username={f.username ?? "User"}
                  />
                  <PressableScale
                    style={{
                      padding: 6,
                    }}
                    onPress={() =>
                      deleteFriend(f.friendship_id, f.username ?? "user")
                    }
                  >
                    <Ionicons name="trash" size={20} />
                  </PressableScale>
                </View>
                <InkText variant="caption">{f.username}</InkText>
                <InkText
                  variant="caption"
                  style={{
                    fontSize: 10,
                    color: getFriendStatusColor(f.friendship_status),
                  }}
                >
                  {f.friendship_status}
                </InkText>
              </View>
            ))}
          </ScrollView>
        ) : (
          <InkText variant="caption">No friends</InkText>
        )}
      </View>

      <Field
        label="SEARCH FRIENDS"
        placeholder="john"
        value={searchFriend}
        onChangeText={setSearchFriend}
      />

      <Field
        label="USERNAME"
        value={username}
        onChangeText={setUsername}
        placeholder="your_username"
      />

      <Field
        label="PASSWORD (optional)"
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

      <View style={{ gap: 6 }}>
        <PressableScale
          onPress={handleSave}
          disabled={isSaving || !hasUnsavedChanges}
          style={{
            alignItems: "center",
            backgroundColor: "#000000",
            opacity: isSaving || !hasUnsavedChanges ? 0.5 : 1,
            padding: 16,
          }}
        >
          <InkText variant="button" style={{ color: "#FFFFFF" }}>
            {isSaving ? "SAVING..." : "SAVE PROFILE"}
          </InkText>
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
    </KeyboardAwareScrollView>
  );
}
