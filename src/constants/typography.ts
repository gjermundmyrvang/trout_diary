import type { TextStyle } from "react-native";

export const fontFamily = {
  script: "TroutScript",

  serif: "TroutSerif",
  serifMedium: "TroutSerif-Medium",
  serifSemiBold: "TroutSerif-SemiBold",
  serifBold: "TroutSerif-Bold",

  mono: "TroutMono",
  monoMedium: "TroutMono-Medium",
  monoBold: "TroutMono-Bold",
} as const;

export const typography = {
  appTitle: {
    fontFamily: fontFamily.script,
    fontSize: 44,
    lineHeight: 52,
  },

  screenTitle: {
    fontFamily: fontFamily.serifBold,
    fontSize: 32,
    lineHeight: 38,
  },

  catchName: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 24,
    lineHeight: 30,
  },

  sectionLabel: {
    fontFamily: fontFamily.monoBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
  },

  body: {
    fontFamily: fontFamily.script,
    fontSize: 20,
    lineHeight: 28,
  },

  formInput: {
    fontFamily: fontFamily.mono,
    fontSize: 16,
    lineHeight: 22,
  },

  measurement: {
    fontFamily: fontFamily.monoBold,
    fontSize: 28,
    lineHeight: 34,
  },

  button: {
    fontFamily: fontFamily.monoBold,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1,
  },

  caption: {
    fontFamily: fontFamily.mono,
    fontSize: 12,
    lineHeight: 16,
  },
} satisfies Record<string, TextStyle>;
