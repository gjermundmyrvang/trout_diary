import { fishSpecies } from "@/constants/fishSpecies";
import { FeedCatchWithImage } from "@/logic/feed";
import { Image, ImageSourcePropType, View } from "react-native";
import { CatchStats } from "./CatchStats";
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
  return (
    <View
      key={catchItem.id}
      style={{
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#AAAAAA",
        backgroundColor: "#FAFAFA",
        shadowColor: "#241D17",
        shadowOffset: { width: 3, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 2,
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
          padding: 14,
          borderBottomWidth: 1,
          borderBottomColor: "#AAAAAA",
        }}
      >
        <View style={{ flex: 1, gap: 3 }}>
          <InkText variant="sectionLabel">
            {catchItem.username.toUpperCase()}
          </InkText>

          <InkText variant="caption">
            {formatCaughtAt(catchItem.caught_at)}
          </InkText>
        </View>

        {catchItem.location_name && (
          <InkText
            variant="caption"
            style={{
              flexShrink: 1,
              textAlign: "right",
            }}
          >
            {catchItem.location_name}
          </InkText>
        )}
      </View>

      <View
        style={{
          height: 220,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#D9E0D2",
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

      <View style={{ gap: 4, padding: 14 }}>
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

        {catchItem.length_cm !== null && catchItem.weight_grams !== null && (
          <CatchStats catchItem={catchItem} />
        )}

        {catchItem.description && (
          <InkText variant="body" style={{ marginTop: 16 }}>
            "{catchItem.description}"
          </InkText>
        )}
      </View>
    </View>
  );
}
