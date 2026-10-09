import LottieView from "lottie-react-native";
import type { StyleProp, ViewStyle } from "react-native";

type LottieAnimationProps = {
  source: string;
  width?: number;
  height?: number;
  autoPlay?: boolean;
  loop?: boolean;
  style?: StyleProp<ViewStyle>;
  speed?: number;
};

export function LottieAnimation({
  source,
  width = 160,
  height = 160,
  autoPlay = true,
  loop = true,
  style,
  speed = 0.5,
}: LottieAnimationProps) {
  return (
    <LottieView
      speed={speed}
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      style={[
        {
          width,
          height,
        },
        style,
      ]}
    />
  );
}
