import Field from "@/components/Field";
import { useSession } from "@/providers/AuthProvider";
import { router, useLocalSearchParams } from "expo-router";
import { PressableScale } from "pressto";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function Verify() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { verifyOTP } = useSession();

  const handleVerify = async () => {
    if (!email) {
      Alert.alert(
        "Email missing",
        "Please go back and request a new sign-in code.",
      );
      return;
    }

    const code = otp.trim();

    if (!code) {
      Alert.alert("Code required", "Enter the code from your email.");
      return;
    }

    try {
      setIsSubmitting(true);

      await verifyOTP(email, code);

      /*
       * No manual router.replace() is necessary here.
       *
       * Supabase emits an auth-state change after a successful verification.
       * SessionProvider receives the session, AuthGate sees it, and redirects
       * the user from /verify to /(troutdiary).
       */
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not verify the code.";

      Alert.alert("Invalid or expired code", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={"padding"}
      keyboardVerticalOffset={20}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          gap: 12,
        }}
      >
        <Field
          value={otp}
          onChangeText={setOtp}
          placeholder="123456"
          label="YOUR OTP CODE"
          keyboardType="number-pad"
          autoComplete={"one-time-code"}
        />

        <PressableScale
          onPress={handleVerify}
          disabled={isSubmitting || otp.length < 6}
          style={{
            alignItems: "center",
            borderColor: otp.length < 6 ? "#ccc" : "#000",
            borderWidth: 1,
            opacity: isSubmitting ? 0.5 : 1,
            padding: 12,
          }}
        >
          <Text>{isSubmitting ? "VERIFYING..." : "VERIFY CODE"}</Text>
        </PressableScale>

        <PressableScale onPress={() => router.back()} disabled={isSubmitting}>
          <Text>USE A DIFFERENT EMAIL</Text>
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}
