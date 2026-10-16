import { InkText } from "@/components/InkText";
import type { GearSet } from "@/types/gear";
import { PressableScale } from "pressto";
import { View } from "react-native";

type GearSetCardProps = {
  gearSet: GearSet;
  onPress?: (gearSet: GearSet) => void;
  selected?: boolean;
  disabled?: boolean;
  width?: number | `${number}%`;
};

export default function GearSetCard({
  gearSet,
  onPress,
  selected = false,
  disabled = false,
  width = "30%",
}: GearSetCardProps) {
  return (
    <PressableScale
      onPress={() => onPress?.(gearSet)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Gear set: ${gearSet.name}`}
      accessibilityState={{ selected, disabled }}
      style={{
        width,
        minHeight: 130,
        justifyContent: "space-between",
        padding: 10,
        borderWidth: selected ? 2 : 1,
      }}
    >
      <InkText variant="caption" numberOfLines={2}>
        {gearSet.name}
      </InkText>

      <View style={{ gap: 2 }}>
        {gearSet.rod ? (
          <InkText
            variant="caption"
            numberOfLines={1}
            style={{ fontSize: 11, opacity: 0.65 }}
          >
            Rod: {gearSet.rod}
          </InkText>
        ) : null}

        {gearSet.reel ? (
          <InkText
            variant="caption"
            numberOfLines={1}
            style={{ fontSize: 11, opacity: 0.65 }}
          >
            Reel: {gearSet.reel}
          </InkText>
        ) : null}

        {gearSet.line ? (
          <InkText
            variant="caption"
            numberOfLines={1}
            style={{ fontSize: 11, opacity: 0.65 }}
          >
            Line: {gearSet.line}
          </InkText>
        ) : null}
      </View>
    </PressableScale>
  );
}
