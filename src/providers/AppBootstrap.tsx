import {
  DMMono_400Regular,
  DMMono_500Medium,
} from "@expo-google-fonts/dm-mono";
import {
  LibreBodoni_400Regular,
  LibreBodoni_500Medium,
  LibreBodoni_600SemiBold,
  LibreBodoni_700Bold,
} from "@expo-google-fonts/libre-bodoni";
import { Satisfy_400Regular } from "@expo-google-fonts/satisfy";
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import { type PropsWithChildren, useEffect } from "react";

import { useSession } from "@/providers/AuthProvider";

void SplashScreen.preventAutoHideAsync().catch(() => {
  // This can happen during Fast Refresh when the splash screen is already hidden.
});

export function AppBootstrap({ children }: PropsWithChildren) {
  const { isLoading: isSessionLoading } = useSession();

  const [fontsLoaded, fontError] = useFonts({
    // Handwritten accent font: use sparingly, primarily headings.
    TroutScript: Satisfy_400Regular,

    // Editorial / serif font: titles and longer displayed text.
    TroutSerif: LibreBodoni_400Regular,
    "TroutSerif-Medium": LibreBodoni_500Medium,
    "TroutSerif-SemiBold": LibreBodoni_600SemiBold,
    "TroutSerif-Bold": LibreBodoni_700Bold,

    // Practical data/form font: labels, inputs, numbers, timestamps.
    TroutMono: DMMono_400Regular,
    "TroutMono-Medium": DMMono_500Medium,
    "TroutMono-Bold": DMMono_500Medium,
  });

  const isReady = !isSessionLoading && (fontsLoaded || fontError);

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  if (fontError) {
    console.warn("Could not load one or more app fonts:", fontError);
  }

  return <>{children}</>;
}
