import { InkText } from "@/components/InkText";
import { typography } from "@/constants/typography";
import { getFeedCatchById } from "@/logic/feed";
import { getGearSetById } from "@/logic/gears";
import { FeedCatchWithGear } from "@/types/feed";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import Svg, { Path, Text as SvgText } from "react-native-svg";

export const FISH_PATH =
  "M0 3 L20 20 L0 37 L7 20 Z M16 20 C35 2 80 2 100 20 C80 38 35 38 16 20 Z";

export default function CatchStatsSheet() {
  const { catchItemId } = useLocalSearchParams<{ catchItemId: string }>();
  const [feedCatch, setFeedCatch] = useState<FeedCatchWithGear | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatch() {
      try {
        const catchData = await getFeedCatchById(catchItemId);
        const gearSet = await getGearSetById(catchData.gear_set_id);
        const catchWithGear = {
          ...catchData,
          gearSet,
        };
        setFeedCatch(catchWithGear as FeedCatchWithGear);
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

  if (!feedCatch) {
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

  const cm = feedCatch.length_cm;
  const g = feedCatch.weight_grams;

  if (cm == null || cm <= 0) {
    return (
      <View
        style={{
          flex: 1,
          minHeight: 400,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <InkText>No length recorded for this catch.</InkText>
      </View>
    );
  }

  const max = Math.ceil((cm + 20) / 5) * 5;
  const step = max > 60 ? 5 : 1;
  const labelEvery = max > 60 ? 10 : 5;
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  const pct = (t: number) => `${(t / max) * 100}%` as const;

  const gearSet = feedCatch.gearSet;

  const hasCatchDetails = Boolean(
    gearSet || feedCatch.lure_or_fly || feedCatch.location_name,
  );

  return (
    <View
      style={{
        flex: 1,
        minHeight: 400,
        position: "relative",
        paddingHorizontal: 16,
        paddingTop: 20,
      }}
    >
      <View style={{ width: "100%", flex: 1 }}>
        <InkText variant="formInput">SIZE AND WEIGHT</InkText>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap-reverse",
          }}
        >
          <View style={{ width: pct(cm) }}>
            <Svg width="100%" viewBox="0 0 100 40" style={{ aspectRatio: 2.5 }}>
              <Path d={FISH_PATH} fill="#000" />
              <SvgText
                x={50}
                y={24}
                font={typography.caption}
                textAnchor="middle"
                fill="#fff"
              >
                {cm} cm
              </SvgText>
            </Svg>
          </View>

          {g != null && (
            <InkText
              variant="caption"
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                fontSize: 22,
                lineHeight: 40,
              }}
            >
              {g} g
            </InkText>
          )}
        </View>

        <View style={{ height: 40, borderTopWidth: 1, borderColor: "#000" }}>
          {ticks.map((t) => (
            <View key={t}>
              <View
                style={{
                  position: "absolute",
                  left: pct(t),
                  marginLeft: -0.5,
                  width: 1,
                  height: t % labelEvery === 0 ? 14 : 7,
                  backgroundColor: "#000",
                }}
              />
              {t % labelEvery === 0 && (
                <Text
                  style={{
                    position: "absolute",
                    top: 16,
                    left: pct(t),
                    width: 30,
                    marginLeft: -15,
                    textAlign: "center",
                    fontSize: 10,
                  }}
                >
                  {t}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>
      {hasCatchDetails && (
        <View style={{ marginTop: 24, gap: 14 }}>
          <InkText variant="formInput">CATCH DETAILS</InkText>

          {feedCatch.location_name ? (
            <View style={{ gap: 2 }}>
              <InkText variant="sectionLabel" style={{ opacity: 0.6 }}>
                LOCATION
              </InkText>
              <InkText variant="caption">{feedCatch.location_name}</InkText>
            </View>
          ) : null}

          {gearSet && (
            <View
              style={{
                padding: 12,
                gap: 6,
                borderWidth: 1,
                borderColor: "#E1E1E1",
                backgroundColor: "#FAFAFA",
              }}
            >
              <InkText variant="caption" style={{ opacity: 0.6 }}>
                GEAR SET
              </InkText>

              <InkText variant="caption">{gearSet.name}</InkText>

              {gearSet.rod ? (
                <InkText variant="caption" style={{ opacity: 0.7 }}>
                  Rod: {gearSet.rod}
                </InkText>
              ) : null}

              {gearSet.reel ? (
                <InkText variant="caption" style={{ opacity: 0.7 }}>
                  Reel: {gearSet.reel}
                </InkText>
              ) : null}

              {gearSet.line ? (
                <InkText variant="caption" style={{ opacity: 0.7 }}>
                  Line: {gearSet.line}
                </InkText>
              ) : null}
            </View>
          )}

          {feedCatch.lure_or_fly ? (
            <View style={{ gap: 2 }}>
              <InkText variant="sectionLabel" style={{ opacity: 0.6 }}>
                {feedCatch.lure_or_fly_type === "fly" ? "FLY" : "LURE"}
              </InkText>
              <InkText variant="caption">{feedCatch.lure_or_fly}</InkText>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}
