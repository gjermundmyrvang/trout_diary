import CatchCard from "@/components/CatchCard";
import { InkText } from "@/components/InkText";
import { getCatchImageUrl } from "@/logic/catchImages";
import { getFeedCatchById } from "@/logic/feed";
import { FeedCatchWithImage } from "@/types/feed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function Catch() {
  const { catchItemId } = useLocalSearchParams<{ catchItemId: string }>();
  const [catchItem, setCatchItem] = useState<FeedCatchWithImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatch() {
      try {
        const catchData = await getFeedCatchById(catchItemId);
        const catchImage = await getCatchImageUrl(catchData.image_path);

        const catchWithImage: FeedCatchWithImage = {
          ...catchData,
          imageUrl: catchImage,
        };
        setCatchItem(catchWithImage);
      } catch (error) {
        console.warn("Failed to fetch catch by id", error);
      } finally {
        setLoading(false);
      }
    }

    if (catchItemId) {
      loadCatch();
    } else {
      setLoading(false);
    }
  }, [catchItemId]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          minHeight: 400,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#000" />
      </View>
    );
  }

  if (!catchItem) {
    return (
      <View
        style={{
          flex: 1,
          minHeight: 400,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <InkText>Catch not found.</InkText>
      </View>
    );
  }
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flex: 1, paddingTop: 80 }}
      bottomOffset={100}
    >
      <CatchCard catchItem={catchItem} />
    </KeyboardAwareScrollView>
  );
}
