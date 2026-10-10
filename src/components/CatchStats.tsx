import { typography } from "@/constants/typography";
import { FeedCatch } from "@/logic/feed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import Svg, { Path, Text as SvgText } from "react-native-svg";
import { InkText } from "./InkText";

type CatchStatsProps = { catchItem: FeedCatch };

export const FISH_PATH =
  "M0 3 L20 20 L0 37 L7 20 Z M16 20 C35 2 80 2 100 20 C80 38 35 38 16 20 Z";

export function CatchStats({ catchItem }: CatchStatsProps) {
  const cm = catchItem.length_cm;
  const g = catchItem.weight_grams;
  if (cm == null || cm <= 0) return null;

  const max = Math.ceil((cm + 20) / 5) * 5; // ruler runs 0 to fish length + 20
  const step = max > 60 ? 5 : 1; // fewer ticks for long fish
  const labelEvery = max > 60 ? 10 : 5;
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step);
  const pct = (t: number) => `${(t / max) * 100}%` as const;

  return (
    <View style={{ width: "100%" }}>
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 6,
            }}
          >
            <Ionicons name="scale-sharp" size={22} />
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
          </View>
        )}
      </View>

      {/* Ruler */}
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
  );
}
