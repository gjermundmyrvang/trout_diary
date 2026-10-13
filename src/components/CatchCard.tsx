import { fishSpecies } from "@/constants/fishSpecies";
import { getCatchComments } from "@/logic/catches";
import { FeedCatchWithImage } from "@/logic/feed";
import { Comment } from "@/types/catches";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { useEffect, useState } from "react";
import { Image, ImageSourcePropType, View } from "react-native";
import { Avatar } from "./Avatar";
import CatchSocial from "./CatchSocial";
import Comments from "./Comments";
import { InkText } from "./InkText";

type CatchCardProps = {
  catchItem: FeedCatchWithImage;
};

const defaultFishIllustration = require("@/assets/fish/brown-trout.png");

function getFishIllustration(troutType: string): ImageSourcePropType {
  const species = fishSpecies.find(
    (species) => species.commonName === troutType,
  );

  return species?.image ?? defaultFishIllustration;
}

function formatCaughtAt(caughtAt: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(caughtAt));
}

export default function CatchCard({ catchItem }: CatchCardProps) {
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
        <Avatar
          username={catchItem.username}
          path={catchItem.avatar_path}
          size={50}
        />
        <View style={{ flex: 1, gap: 3 }}>
          <InkText variant="sectionLabel">
            {catchItem.username.toUpperCase()}
          </InkText>

          <InkText variant="caption">
            {formatCaughtAt(catchItem.caught_at)}
          </InkText>
        </View>

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
        <Image
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
