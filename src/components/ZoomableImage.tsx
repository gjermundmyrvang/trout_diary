// ZoomableImage.tsx
import type {
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
} from "react-native";
import { Image, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type ZoomableImageProps = {
  source: ImageSourcePropType;
  resizeMode?: ImageResizeMode;
  style: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export function ZoomableImage({
  source,
  resizeMode = "cover",
  style,
  accessibilityLabel,
}: ZoomableImageProps) {
  const scale = useSharedValue(MIN_SCALE);
  const scaleAtStart = useSharedValue(MIN_SCALE);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      scaleAtStart.value = scale.value;
    })
    .onUpdate((event) => {
      const nextScale = scaleAtStart.value * event.scale;

      scale.value = Math.max(MIN_SCALE, Math.min(nextScale, MAX_SCALE));
    })
    .onEnd(() => {
      // Snap back to normal if the user has zoomed out too far.
      if (scale.value < MIN_SCALE) {
        scale.value = withTiming(MIN_SCALE);
      }
    });

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pinchGesture}>
        <Animated.View style={[styles.imageWrapper, animatedImageStyle]}>
          <Image
            source={source}
            resizeMode={resizeMode}
            style={style}
            accessibilityLabel={accessibilityLabel}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
  },
});
