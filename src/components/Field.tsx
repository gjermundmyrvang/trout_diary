import { typography } from "@/constants/typography";
import { useState } from "react";
import { TextStyle, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { InkText } from "./InkText";

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "number-pad" | "decimal-pad" | "email-address";
  minHeight?: number;
  multiline?: boolean;
  font?: TextStyle;
  autoComplete?: any | undefined;
  password?: boolean;
};

export default function Field({
  label,
  value,
  placeholder,
  onChangeText,
  keyboardType = "default",
  minHeight = 50,
  multiline = false,
  font = typography.formInput,
  autoComplete = undefined,
  password = false,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = focused ? "#000" : "#ccc";

  return (
    <View style={{ gap: 8 }}>
      <InkText variant="sectionLabel">{label}</InkText>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          font,
          {
            borderColor: borderColor,
            borderWidth: 1,
            padding: 12,
            minHeight: minHeight,
          },
        ]}
        autoCapitalize="none"
        autoComplete={autoComplete}
        secureTextEntry={password}
      />
    </View>
  );
}
