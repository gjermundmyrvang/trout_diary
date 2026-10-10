import Field from "@/components/Field";
import { InkText } from "@/components/InkText";
import { useCommentStore } from "@/logic/useCommentStore";
import { router, useLocalSearchParams } from "expo-router";
import { PressableScale } from "pressto";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function CommentScreen() {
  const { catchId } = useLocalSearchParams<{ catchId?: string }>();
  const initialComment = useCommentStore((state) =>
    catchId ? (state.commentsByCatchId[catchId] ?? "") : "",
  );
  const [comment, setComment] = useState(initialComment);
  const setCommentText = useCommentStore((state) => state.setCommentText);

  useEffect(() => {
    setComment(initialComment);
  }, [initialComment]);

  function handleWriteComment() {
    const body = comment.trim();

    if (!body || !catchId) {
      return;
    }

    setCommentText(catchId, comment);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
        position: "relative",
        minHeight: 400,
        paddingHorizontal: 20,
        paddingVertical: 20,
      }}
      behavior={"padding"}
      keyboardVerticalOffset={20}
    >
      <View
        style={{
          gap: 8,
          marginTop: 4,
        }}
      >
        <Field
          label={`Add comment (${comment.length}/500)`}
          value={comment}
          onChangeText={setComment}
          placeholder="What a beautiful looking trout!"
          multiline={true}
          minHeight={80}
        />
        <PressableScale
          onPress={handleWriteComment}
          disabled={!comment.trim()}
          accessibilityRole="button"
          accessibilityLabel="Finish write comment"
          style={{
            backgroundColor: !comment.trim() ? "#ccc" : "#000",
            paddingHorizontal: 14,
            paddingVertical: 11,
          }}
        >
          <InkText variant="button" style={{ color: "white" }}>
            DONE
          </InkText>
        </PressableScale>
      </View>
    </KeyboardAvoidingView>
  );
}
