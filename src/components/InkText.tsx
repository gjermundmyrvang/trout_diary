import { Text, type TextProps, type TextStyle } from "react-native";

import { typography } from "@/constants/typography";

type InkTextVariant = keyof typeof typography;

type InkTextProps = TextProps & {
  variant?: InkTextVariant;
  style?: TextStyle | TextStyle[];
};

export function InkText({ variant = "body", style, ...props }: InkTextProps) {
  return <Text {...props} style={[typography[variant], style]} />;
}
