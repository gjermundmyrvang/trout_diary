import Ionicons from "@expo/vector-icons/Ionicons";
import { PressableScale } from "pressto";
import { View, ViewStyle } from "react-native";
import { InkText } from "./InkText";

type FABProps = {
  label?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconSize?: number;
  onPress: () => void;
  fabStyle?: ViewStyle;
};

const defaultFABStyle: ViewStyle = {
  backgroundColor: "#fafafa",
  width: 50,
  height: 50,
  borderRadius: 25,
  alignItems: "center",
  justifyContent: "center",
};

export default function FAB({
  label,
  icon,
  iconColor = "#000",
  iconSize = 22,
  onPress,
  fabStyle = defaultFABStyle,
}: FABProps) {
  return (
    <View style={{ position: "absolute", bottom: 100, right: 25 }}>
      <PressableScale onPress={onPress} style={fabStyle}>
        <Ionicons name={icon} color={iconColor} size={iconSize} />
        {label && <InkText variant="button">{label}</InkText>}
      </PressableScale>
    </View>
  );
}
