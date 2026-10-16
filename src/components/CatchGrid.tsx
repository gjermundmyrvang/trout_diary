import { InkText } from "@/components/InkText";
import { deleteCatch } from "@/logic/catches";
import { formatCaughtAt, getFishIllustration } from "@/logic/utils";
import { FeedCatchWithImage } from "@/types/feed";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { Alert, Image, View } from "react-native";

type CatchGridProps = {
  catches: FeedCatchWithImage[];
};

export function CatchGrid({ catches }: CatchGridProps) {
  async function handleLongPress(catchId: string) {
    Alert.alert(
      "Delete Catch?",
      "This permanently deletes your catch and associated data",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete catch",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCatch(catchId);
              Alert.alert(`Removed catch`);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Could not delete your catch.";

              Alert.alert("Could not delete catch", message);
            }
          },
        },
      ],
    );
  }
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        paddingHorizontal: 8,
      }}
    >
      {catches.map((catchItem) => (
        <View
          key={catchItem.id}
          style={{
            width: "48%",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <PressableScale
            onPress={() =>
              router.push({
                pathname: "/catch",
                params: { catchItemId: catchItem.id },
              })
            }
            onLongPress={() => handleLongPress(catchItem.id)}
            accessibilityRole="button"
            accessibilityLabel={`View catch: ${catchItem.trout_type}`}
          >
            <View
              style={{
                width: "100%",
                aspectRatio: 1,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={
                  catchItem.imageUrl
                    ? { uri: catchItem.imageUrl }
                    : getFishIllustration(catchItem.trout_type)
                }
                resizeMode={catchItem.imageUrl ? "cover" : "contain"}
                style={{
                  width: catchItem.imageUrl ? "100%" : "82%",
                  height: catchItem.imageUrl ? "100%" : "82%",
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
                minHeight: 52,
                paddingHorizontal: 8,
                paddingVertical: 7,
                gap: 2,
              }}
            >
              <InkText variant="sectionLabel" numberOfLines={1}>
                {catchItem.trout_type}
              </InkText>

              {catchItem.lure_or_fly && (
                <InkText
                  variant="caption"
                  style={{ opacity: 0.65, fontSize: 10 }}
                >
                  {catchItem.lure_or_fly}
                </InkText>
              )}

              {catchItem.location_name && (
                <InkText
                  variant="caption"
                  style={{ opacity: 0.65, fontSize: 10 }}
                >
                  @ {catchItem.location_name}
                </InkText>
              )}
              <InkText
                variant="caption"
                numberOfLines={1}
                style={{ opacity: 0.65, fontSize: 10 }}
              >
                {formatCaughtAt(catchItem.caught_at)}
              </InkText>
            </View>
          </PressableScale>
        </View>
      ))}
    </View>
  );
}
