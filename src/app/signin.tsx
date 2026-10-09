import Field from "@/components/Field";
import { InkText } from "@/components/InkText";
import { useSession } from "@/providers/AuthProvider";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInWithPassword, setSignInWithPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signInWithOTP, signInUsingPassword } = useSession();

  const handleSignIn = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert("Email required", "Enter your email address.");
      return;
    }

    try {
      setIsSubmitting(true);

      await signInWithOTP(normalizedEmail);

      router.push({
        pathname: "/verify",
        params: {
          email: normalizedEmail,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send the code.";

      Alert.alert("Could not send code", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInWithPassword = async () => {
    if (password.length < 6) {
      Alert.alert("Invalid password", "Password requires 6 letters");
      return;
    }

    try {
      setIsSubmitting(true);

      await signInUsingPassword(email, password);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not log in with password at the moment";

      Alert.alert("Could not log in", message);
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
          label="EMAIL"
          value={email}
          onChangeText={setEmail}
          placeholder="youremail@domain"
          keyboardType="email-address"
        />

        {signInWithPassword ? (
          <>
            <Field
              label="PASSWORD"
              value={password}
              onChangeText={setPassword}
              placeholder="yourpassword"
              password={signInWithPassword}
            />

            <PressableScale
              onPress={handleSignInWithPassword}
              disabled={isSubmitting}
              style={{
                alignItems: "center",
                borderColor: password.length > 0 ? "#000" : "#ccc",
                borderWidth: 1,
                opacity: isSubmitting ? 0.5 : 1,
                padding: 12,
              }}
            >
              <Text>{isSubmitting ? "LOGGING IN..." : "LOG IN"}</Text>
            </PressableScale>
          </>
        ) : (
          <PressableScale
            onPress={handleSignIn}
            disabled={isSubmitting}
            style={{
              alignItems: "center",
              borderColor: email.includes("@") ? "#000" : "#ccc",
              borderWidth: 1,
              opacity: isSubmitting ? 0.5 : 1,
              padding: 12,
            }}
          >
            <Text>{isSubmitting ? "SENDING..." : "SEND CODE"}</Text>
          </PressableScale>
        )}

        <InkText variant="caption" style={{ textAlign: "center" }}>
          - OR -
        </InkText>
        <PressableScale
          onPress={() => setSignInWithPassword(!signInWithPassword)}
        >
          <InkText
            variant="formInput"
            style={{ textAlign: "center", textDecorationLine: "underline" }}
          >
            {signInWithPassword
              ? "Sign in using OTP"
              : "Sign in with password*"}
          </InkText>
        </PressableScale>
        {!signInWithPassword && (
          <InkText
            variant="caption"
            style={{ textAlign: "center", fontSize: 8 }}
          >
            *requires you have set up a password earlier in profile
          </InkText>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
