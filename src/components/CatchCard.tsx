import { getCatchComments } from "@/logic/catches";
import { formatCaughtAt, getFishIllustration } from "@/logic/utils";
import { Comment } from "@/types/catches";
import { FeedCatchWithImage } from "@/types/feed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { Avatar } from "./Avatar";
import CatchSocial from "./CatchSocial";
import Comments from "./Comments";
import { InkText } from "./InkText";
import { ZoomableImage } from "./ZoomableImage";

type CatchCardProps = {
  userId: string | null;
  catchItem: FeedCatchWithImage;
};

export default function CatchCard({ userId, catchItem }: CatchCardProps) {
  const fallbackImage = getFishIllustration(catchItem.trout_type);

  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  async function loadComments() {
    try {
      setLoadingComments(true);
      const catchComments = await getCatchComments(catchItem.id);
      setComments(catchComments);
    } catch (error) {
      console.warn("Could not load comments:", error);
    } finally {
      setLoadingComments(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  function handleNavigateToFriend(friendId: string) {
    const isYou = friendId === userId;

    if (isYou) {
      router.push("/(troutdiary)/profile");
      return;
    }

    router.push({
      pathname: "/friend-profile",
      params: {
        userId: friendId,
      },
    });
  }

  return (
    <View
      key={catchItem.id}
      style={{
        overflow: "hidden",
        gap: 6,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          paddingHorizontal: 16,
        }}
      >
        <PressableScale
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 6,
          }}
          onPress={() => handleNavigateToFriend(catchItem.user_id)}
        >
          <Avatar
            username={catchItem.username}
            path={catchItem.avatar_path}
            size={50}
          />

          <View>
            {catchItem.username && (
              <InkText variant="sectionLabel">
                {catchItem.username.toUpperCase()}
              </InkText>
            )}

            <InkText variant="caption">
              {formatCaughtAt(catchItem.caught_at)}
            </InkText>
          </View>
        </PressableScale>

        {catchItem.location_name && (
          <View
            style={{
              flexDirection: "row",
              gap: 4,
              alignItems: "center",
            }}
          >
            <Ionicons name="location-outline" size={20} />
            <InkText
              variant="caption"
              style={{
                flexShrink: 1,
                textAlign: "right",
              }}
            >
              {catchItem.location_name}
            </InkText>
          </View>
        )}
      </View>

      <View
        style={{
          height: 340,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#D9E0D2",
          padding: 0,
        }}
      >
        <ZoomableImage
          source={
            catchItem.imageUrl ? { uri: catchItem.imageUrl } : fallbackImage
          }
          resizeMode={catchItem.imageUrl ? "cover" : "contain"}
          style={{
            width: catchItem.imageUrl ? "100%" : "90%",
            height: catchItem.imageUrl ? "100%" : "90%",
          }}
          accessibilityLabel={
            catchItem.imageUrl
              ? `Photo of a ${catchItem.trout_type}`
              : `Illustration of a ${catchItem.trout_type}`
          }
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 6,
          paddingHorizontal: 16,
        }}
      >
        <View>
          <InkText variant="catchName">
            {catchItem.trout_type.toUpperCase()}
          </InkText>

          {catchItem.scientific_name && (
            <InkText
              variant="caption"
              style={{
                fontStyle: "italic",
                opacity: 0.7,
              }}
            >
              {catchItem.scientific_name}
            </InkText>
          )}
        </View>
        <CatchSocial
          catchId={catchItem.id}
          numComments={comments.length}
          showComments={showComments}
          setShowComments={setShowComments}
          loadingComments={loadingComments}
        />
      </View>
      {showComments ? (
        <Comments
          comments={comments}
          catchId={catchItem.id}
          loadComments={loadComments}
        />
      ) : (
        <View style={{ paddingHorizontal: 16 }}>
          {catchItem.description && (
            <View style={{ gap: 8 }}>
              <InkText variant="caption">{catchItem.username}:</InkText>
              <InkText variant="body" style={{ marginTop: 16 }}>
                {catchItem.description}
              </InkText>
            </View>
          )}
          <PressableScale
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#000",
              justifyContent: "center",
              padding: 12,
              marginTop: 16,
            }}
            onPress={() =>
              router.push({
                pathname: "/catch-stats",
                params: { catchItemId: catchItem.id },
              })
            }
          >
            <Ionicons name="bar-chart" size={28} color={"white"} />
            <InkText variant="button" style={{ color: "white" }}>
              VIEW CATCH STATS
            </InkText>
          </PressableScale>
        </View>
      )}
    </View>
  );
}
