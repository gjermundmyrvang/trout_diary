import CatchCard from "@/components/CatchCard";
import CatchSocial from "@/components/CatchSocial";
import FAB from "@/components/FAB";
import { InkText } from "@/components/InkText";
import { getCatchImageUrl } from "@/logic/catchImages";
import { FeedCatch, FeedCatchWithImage, getFeedCatches } from "@/logic/feed";
import { getMyProfile } from "@/logic/profiles";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

export default function FeedScreen() {
  const [username, setUsername] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedCatchWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [socialRefreshKey, setSocialRefreshKey] = useState(0);

  async function loadProfile() {
    const loadedProfile = await getMyProfile();
    if (loadedProfile) {
      setUsername(loadedProfile.username);
    }
  }

  async function loadFeed() {
    try {
      const catches = (await getFeedCatches()) as FeedCatch[];

      const catchesWithImages = await Promise.all(
        (catches ?? []).map(async (catchItem) => ({
          ...catchItem,
          imageUrl: await getCatchImageUrl(catchItem.image_path),
        })),
      );

      setFeed(catchesWithImages);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load feed.";

      console.error(error);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setSocialRefreshKey((current) => current + 1);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadProfile();
    loadFeed();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#111111" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={{ flex: 1, padding: 24 }}>
        <InkText>{errorMessage}</InkText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          gap: 16,
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
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
        <InkText variant="screenTitle">RECENT CATCHES</InkText>
        {feed.length === 0 && (
          <View
            style={{
              alignItems: "center",
              gap: 8,
              paddingVertical: 48,
            }}
          >
            <InkText variant="catchName">NO CATCHES YET</InkText>
            <InkText variant="caption">
              Add friends or log your first catch.
            </InkText>
          </View>
        )}

        {feed.map((catchItem) => (
          <View key={catchItem.id}>
            <CatchCard catchItem={catchItem} />
            <CatchSocial
              catchId={catchItem.id}
              username={username}
              refreshKey={socialRefreshKey}
            />
          </View>
        ))}
      </ScrollView>
      <FAB icon="person-add" onPress={() => router.push("/friends-screen")} />
    </View>
  );
}
