import { Avatar } from "@/components/Avatar";
import { CatchGrid } from "@/components/CatchGrid";
import { InkText } from "@/components/InkText";
import { getCatchImageUrl } from "@/logic/catchImages";
import { getFriendCatches, getFriendProfile } from "@/logic/feed";
import { FeedCatch, FeedCatchWithImage } from "@/types/feed";
import { Profile } from "@/types/profile";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

export default function FriendProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();

  const [catches, setCatches] = useState<FeedCatchWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [friendProfile, setFriendProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async () => {
    if (!userId) {
      return;
    }
    const fetchedProfile = await getFriendProfile(userId);
    setFriendProfile(fetchedProfile);
  }, [userId]);

  const loadCatches = useCallback(async () => {
    if (!userId) {
      return;
    }

    const rawCatches = await getFriendCatches(userId);
    const catchesWithImages = await Promise.all(
      (rawCatches as FeedCatch[]).map(async (catchItem) => ({
        ...catchItem,
        imageUrl: await getCatchImageUrl(catchItem.image_path),
      })),
    );

    setCatches(catchesWithImages);
  }, [userId]);

  const loadData = useCallback(async () => {
    try {
      await Promise.all([loadProfile(), loadCatches()]);
    } finally {
      setIsLoading(false);
    }
  }, [loadProfile, loadCatches]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!friendProfile) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <InkText variant="caption">Profile not found.</InkText>
      </View>
    );
  }

  const username = friendProfile.username?.trim() || "User";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 20, paddingBottom: 20, paddingTop: 80 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={80}
          progressBackgroundColor="#000"
          tintColor="#000"
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
        <Avatar
          path={friendProfile.avatar_path}
          username={username}
          size={120}
        />

        <View style={{ flex: 1, gap: 8 }}>
          <InkText variant="appTitle">{username}</InkText>

          <View>
            <InkText variant="sectionLabel">{catches.length}</InkText>
            <InkText variant="caption" style={{ color: "#575757" }}>
              {catches.length === 1 ? "Catch" : "Catches"}
            </InkText>
          </View>
        </View>
      </View>

      <InkText
        variant="screenTitle"
        style={{ fontSize: 20, paddingHorizontal: 8 }}
      >
        {username.toUpperCase()}&apos;S CATCHES
      </InkText>

      {catches.length > 0 ? (
        <CatchGrid catches={catches} />
      ) : (
        <InkText variant="caption" style={{ paddingHorizontal: 8 }}>
          {username} has no catches yet.
        </InkText>
      )}
    </ScrollView>
  );
}
