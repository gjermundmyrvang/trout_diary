import { Avatar } from "@/components/Avatar";
import { CatchGrid } from "@/components/CatchGrid";
import Field from "@/components/Field";
import { InkText } from "@/components/InkText";
import { getCatchImageUrl } from "@/logic/catchImages";
import { getUserCatches } from "@/logic/feed";
import { getFriends, handleDeleteFriend } from "@/logic/friends";
import { updateAvatarPath } from "@/logic/profiles";
import { useSession } from "@/providers/AuthProvider";
import { FeedCatch, FeedCatchWithImage } from "@/types/feed";
import { Friendship } from "@/types/friends";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const STATUS_COLORS = {
  accepted: "#575757",
  declined: "#bd0000",
  pending: "#6fa4e2",
};
const getFriendStatusColor = (status: "accepted" | "declined" | "pending") =>
  STATUS_COLORS[status];

export default function ProfileScreen() {
  const { profile } = useSession();

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [searchFriend, setSearchFriend] = useState("");

  const [username, setUsername] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  const [catchesByUser, setCatchesByUser] = useState<FeedCatchWithImage[]>([]);

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

  const avatarChanged = selectedAvatarUri !== null;

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  async function loadFriends() {
    const friends = await getFriends();
    setFriends(friends);
  }

  async function loadCatchesByUser() {
    const catches = await getUserCatches();
    const catchesWithImages = await Promise.all(
      (catches as FeedCatch[]).map(async (catchItem) => ({
        ...catchItem,
        imageUrl: await getCatchImageUrl(catchItem.image_path),
      })),
    );
    setCatchesByUser(catchesWithImages);
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFriends();
    await loadCatchesByUser();
    setRefreshing(false);
  }, [loadFriends, loadCatchesByUser]);

  useEffect(() => {
    loadFriends();
    loadCatchesByUser();
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
    if (!profile || !selectedAvatarUri) {
      return;
    }
    try {
      setIsSaving(true);
      await updateAvatarPath(
        selectedAvatarUri,
        profile.avatar_path, // Old path
      );
      setSelectedAvatarUri(null);
      Alert.alert("New profile pricture saved");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not save new profile image";

      Alert.alert("Could not save profile", message);
    } finally {
      setIsSaving(false);
    }
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
        gap: 20,
        paddingBottom: 20,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={80}
          progressBackgroundColor={"#000"}
          tintColor={"#000"}
        />
      }
    >
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          paddingHorizontal: 8,
          alignItems: "flex-start",
        }}
      >
        {/* -------- AVATAR -------- */}
        <View style={{ alignItems: "center", gap: 8 }}>
          <PressableScale
            onPress={handleChooseAvatar}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Choose profile picture"
          >
            <Avatar
              path={profile?.avatar_path}
              localUri={selectedAvatarUri}
              username={username}
              size={120}
            />
          </PressableScale>
        </View>
        {/* -------- PROFILE STATS -------- */}
        <View style={{ flex: 1, gap: 8 }}>
          <InkText variant="appTitle">
            {!username.trim() ? "user" : username}
          </InkText>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <InkText variant="sectionLabel">{catchesByUser.length}</InkText>
              <InkText
                variant="caption"
                style={{ color: getFriendStatusColor("accepted") }}
              >
                Catches
              </InkText>
            </View>
            <View style={{ flex: 1 }}>
              <InkText variant="sectionLabel">{friends.length}</InkText>
              <InkText
                variant="caption"
                style={{ color: getFriendStatusColor("accepted") }}
              >
                {friends.length > 1 ? "Friends" : "Friend"}
              </InkText>
            </View>
          </View>
        </View>
      </View>
      {avatarChanged && (
        <PressableScale
          onPress={handleSave}
          style={{ backgroundColor: "#000", padding: 8 }}
        >
          <InkText variant="button" style={{ color: "white" }}>
            SAVE NEW PROFILE IMAGE
          </InkText>
        </PressableScale>
      )}

      <View>
        <InkText
          variant="screenTitle"
          style={{ fontSize: 20, paddingHorizontal: 8 }}
        >
          FRIENDS
        </InkText>
        {filteredFriends.length > 0 ? (
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <PressableScale
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  borderColor: "#000",
                  borderWidth: 2,
                  marginVertical: 8,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 4,
                }}
                onPress={() => router.push("/friends-screen")}
              >
                <Ionicons name="person-add" size={30} />
              </PressableScale>
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
                      <PressableScale
                        onPress={() =>
                          router.navigate({
                            pathname: "/friend-profile",
                            params: {
                              userId: f.profile_id,
                            },
                          })
                        }
                      >
                        <Avatar
                          path={f.avatar_path}
                          size={50}
                          username={f.username ?? "User"}
                        />
                      </PressableScale>
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
            </View>
            <Field
              placeholder="filter friends"
              value={searchFriend}
              onChangeText={setSearchFriend}
              style={{ marginHorizontal: 8 }}
            />
          </View>
        ) : (
          <View style={{ paddingHorizontal: 8 }}>
            <InkText variant="caption">Currently no friends.</InkText>
          </View>
        )}
      </View>

      <InkText
        variant="screenTitle"
        style={{ fontSize: 20, paddingHorizontal: 8 }}
      >
        YOUR CATCHES
      </InkText>
      {catchesByUser.length > 0 ? (
        <CatchGrid catches={catchesByUser} />
      ) : (
        <InkText variant="caption" style={{ paddingHorizontal: 8 }}>
          No catches yet
        </InkText>
      )}
    </KeyboardAwareScrollView>
  );
}
