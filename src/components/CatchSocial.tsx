import { getCatchLikes, likeCatch, unlikeCatch } from "@/logic/catches";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PressableScale } from "pressto";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { InkText } from "./InkText";

type CatchSocialProps = {
  catchId: string;
  numComments: number;
  showComments: boolean;
  setShowComments: (show: boolean) => void;
  loadingComments: boolean;
};

export default function CatchSocial({
  catchId,
  numComments,
  showComments,
  setShowComments,
  loadingComments,
}: CatchSocialProps) {
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [savingLike, setSavingLike] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadLikes() {
      try {
        setLoading(true);
        const catchLikes = await getCatchLikes(catchId);

        setLikeCount(catchLikes.count);
        setLikedByMe(catchLikes.likedByCurrentUser);
      } catch (error) {
        console.warn("Could not load likes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLikes();
  }, []);

  async function handleLike() {
    if (savingLike) {
      return;
    }

    try {
      setSavingLike(true);

      if (likedByMe) {
        await unlikeCatch(catchId);
        setLikedByMe(false);
        setLikeCount((count) => Math.max(0, count - 1));
      } else {
        await likeCatch(catchId);
        setLikedByMe(true);
        setLikeCount((count) => count + 1);
      }
    } catch (error) {
      Alert.alert(
        "Could not update like",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSavingLike(false);
    }
  }

  if (loading || loadingComments) {
    return <InkText variant="caption">Loading activity...</InkText>;
  }

  return (
    <View>
      {/* Like and comment buttons */}
      <View style={{ flexDirection: "row", gap: 16 }}>
        <PressableScale
          onPress={handleLike}
          disabled={savingLike}
          accessibilityRole="button"
          accessibilityLabel={likedByMe ? "Unlike catch" : "Like catch"}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <InkText variant="caption">{likeCount}</InkText>
          <Ionicons
            name={likedByMe ? "heart" : "heart-outline"}
            color={likedByMe ? "#e21616" : "#000"}
            size={22}
          />
        </PressableScale>

        <PressableScale
          onPress={() => setShowComments(!showComments)}
          accessibilityRole="button"
          accessibilityLabel="Show comments"
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <InkText variant="caption">{numComments}</InkText>
          <Ionicons
            name={showComments ? "chatbox" : "chatbox-outline"}
            size={22}
          />
        </PressableScale>
      </View>
    </View>
  );
}
