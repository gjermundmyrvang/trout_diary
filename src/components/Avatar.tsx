import { getAvatarUrl } from "@/logic/avatars";
import { useEffect, useState } from "react";
import { Image, StyleProp, View, ViewStyle } from "react-native";
import { InkText } from "./InkText";

type AvatarProps = {
  path?: string | null;
  localUri?: string | null;
  username: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function Avatar({
  path,
  localUri,
  username,
  size = 40,
  style,
}: AvatarProps) {
  const [resolvedUri, setResolvedUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Use freshly selected device image over the remote avatar.
    if (localUri) {
      setResolvedUri(localUri);
      return;
    }

    if (!path) {
      setResolvedUri(null);
      return;
    }

    getAvatarUrl(path)
      .then((url) => {
        if (active) {
          setResolvedUri(url);
        }
      })
      .catch((error) => {
        console.error("Could not resolve avatar:", error);

        if (active) {
          setResolvedUri(null);
        }
      });

    return () => {
      active = false;
    };
  }, [path, localUri]);

  const initial = username.trim().charAt(0).toUpperCase() || "?";

  if (!resolvedUri) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: size / 2,
            backgroundColor: "#000",
          },
          style,
        ]}
      >
        <InkText variant="caption" style={{ color: "#fff" }}>
          {initial}
        </InkText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: resolvedUri }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#e5e5e5",
        },
      ]}
      resizeMode="cover"
    />
  );
}
