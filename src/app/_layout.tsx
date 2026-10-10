import { AppBootstrap } from "@/providers/AppBootstrap";
import { SessionProvider, useSession } from "@/providers/AuthProvider";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { PressablesConfig } from "pressto";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  return (
    <SessionProvider>
      <AppBootstrap>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <PressablesConfig
              globalHandlers={{
                onPress: () => {
                  Haptics.selectionAsync();
                },
              }}
            >
              <RootNavigator />
            </PressablesConfig>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </AppBootstrap>
    </SessionProvider>
  );
}

function RootNavigator() {
  const { session } = useSession();

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(troutdiary)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="catch-screen" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen
          name="select-species"
          options={{
            headerShown: false,
            presentation: "formSheet",
            sheetAllowedDetents: "fitToContents",
            sheetGrabberVisible: true,
            contentStyle: {
              backgroundColor: "#FAFAFA",
            },
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen
          name="friends-screen"
          options={{
            headerShown: false,
            presentation: "formSheet",
            sheetAllowedDetents: "fitToContents",
            sheetGrabberVisible: true,
            contentStyle: {
              backgroundColor: "#FAFAFA",
            },
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!!session}>
        <Stack.Screen
          name="comment-screen"
          options={{
            headerShown: false,
            presentation: "formSheet",
            sheetAllowedDetents: "fitToContents",
            sheetGrabberVisible: true,
            contentStyle: {
              backgroundColor: "#FAFAFA",
            },
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="signin" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={!session}>
        <Stack.Screen name="verify" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
