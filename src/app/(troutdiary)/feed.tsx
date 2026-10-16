import CatchCard from "@/components/CatchCard";
import FAB from "@/components/FAB";
import { InkText } from "@/components/InkText";
import { getCatchImageUrl } from "@/logic/catchImages";
import { getFeedCatches } from "@/logic/feed";
import { useSession } from "@/providers/AuthProvider";
import { FeedCatch, FeedCatchWithImage } from "@/types/feed";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";

export default function FeedScreen() {
  const { profile } = useSession();

  const [feed, setFeed] = useState<FeedCatchWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      setErrorMessage(null);

      const catches = await getFeedCatches();

      const catchesWithImages = await Promise.all(
        (catches as FeedCatch[]).map(async (catchItem) => ({
          ...catchItem,
          imageUrl: await getCatchImageUrl(catchItem.image_path),
        })),
      );

      setFeed(catchesWithImages);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load feed.";

      console.error("Failed to load feed:", error);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFeed();
    }, [loadFeed]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }, [loadFeed]);

  useEffect(() => {
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
        <InkText variant="screenTitle" style={{ paddingHorizontal: 16 }}>
          RECENT CATCHES
        </InkText>
        {feed.length === 0 && (
          <View
            style={{
              alignItems: "center",
              gap: 8,
              paddingHorizontal: 16,
            }}
          >
            <InkText variant="catchName">NO CATCHES YET</InkText>
            <InkText variant="caption">
              Add friends or log your first catch.
            </InkText>
          </View>
        )}

        {feed.map((catchItem) => (
          <View
            key={catchItem.id}
            style={{
              paddingTop: 16,
              paddingBottom: 16,
            }}
          >
            <CatchCard userId={profile?.id ?? null} catchItem={catchItem} />
          </View>
        ))}
      </ScrollView>
      <FAB icon="person-add" onPress={() => router.push("/friends-screen")} />
    </View>
  );
}
