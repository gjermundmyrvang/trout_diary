import { LottieAnimation } from "@/components/LottieAnimation";
import { typography } from "@/constants/typography";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import SwipeButton from "rn-swipe-button";

const lottieFiles = {
  idle: require("@/assets/lottie/idle.json"),
  catch: require("@/assets/lottie/catch.json"),
} as const;

export default function Homescreen() {
  const [animation, setAnimation] = useState<keyof typeof lottieFiles>("idle");

  const hasSwiped = useRef(false);
  const navigationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (navigationTimeout.current) {
        clearTimeout(navigationTimeout.current);
      }
    };
  }, []);

  function handleSwiped() {
    if (hasSwiped.current) {
      return;
    }

    hasSwiped.current = true;
    setAnimation("catch");

    navigationTimeout.current = setTimeout(() => {
      setAnimation("idle");
      hasSwiped.current = false;
      router.push("/catch-screen");
    }, 2000);
  }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      <LottieAnimation
        key={animation}
        source={lottieFiles[animation]}
        width={800}
        height={1000}
        loop={animation === "idle"}
        speed={animation === "idle" ? 0.1 : 1}
      />
      <SwipeButton
        title="Slide to catch"
        containerStyles={{
          position: "absolute",
          zIndex: 100,
          bottom: 120,
          width: "90%",
          borderRadius: 0,
        }}
        railBackgroundColor="#fafafa"
        railStyles={{
          backgroundColor: "#000",
          borderColor: "#000",
          borderRadius: 0,
        }}
        thumbIconBackgroundColor="#000"
        thumbIconBorderColor="#000"
        thumbIconStyles={{
          borderRadius: 0,
        }}
        onSwipeSuccess={handleSwiped}
        titleStyles={typography.body}
        shouldResetAfterSuccess={true}
      />
    </View>
  );
}
