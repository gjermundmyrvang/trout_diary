import { addCatchComment, deleteCatchComment } from "@/logic/catches";
import { useSession } from "@/providers/AuthProvider";
import { Comment } from "@/types/catches";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PressableScale } from "pressto";
import { useState } from "react";
import { Alert, View } from "react-native";
import { Avatar } from "./Avatar";
import Field from "./Field";
import { InkText } from "./InkText";

type CommentsProps = {
  comments: Comment[];
  catchId: string;
  loadComments: () => void;
};
export default function Comments({
  comments,
  catchId,
  loadComments,
}: CommentsProps) {
  const { profile } = useSession();
  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  const body = comment.trim();

  async function handleSendComment() {
    if (!profile || !body || sendingComment) {
      return;
    }

    try {
      setSendingComment(true);

      await addCatchComment(
        catchId,
        profile.username,
        body,
        profile.avatar_path,
      );
      setComment("");
      loadComments();
    } catch (error) {
      Alert.alert(
        "Could not post comment",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setSendingComment(false);
    }
  }

  function handleDeleteComment(commentId: string) {
    Alert.alert("Delete comment?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCatchComment(commentId);
            loadComments();
          } catch (error) {
            Alert.alert(
              "Could not delete comment",
              error instanceof Error ? error.message : "Please try again.",
            );
          }
        },
      },
    ]);
  }
  return (
    <View style={{ marginTop: 14, paddingHorizontal: 16 }}>
      {comments.length === 0 ? (
        <InkText variant="caption">No comments yet.</InkText>
      ) : (
        comments.map((comment, idx) => (
          <View
            key={comment.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
              paddingBottom: 12,
              marginBottom: 12,
              borderBottomWidth: 1,
              borderColor: idx + 1 === comments.length ? "transparent" : "#ccc",
            }}
          >
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <Avatar
                  path={comment.comment_avatar}
                  size={30}
                  username={comment.comment_by}
                />
                <InkText variant="sectionLabel" style={{ marginBottom: 8 }}>
                  {comment.comment_by === profile?.username
                    ? "You"
                    : comment.comment_by}
                </InkText>
              </View>

              <InkText variant="caption">{comment.body}</InkText>
            </View>

            {comment.user_id === profile?.id && (
              <PressableScale
                onPress={() => handleDeleteComment(comment.id)}
                accessibilityRole="button"
                accessibilityLabel="Delete your comment"
              >
                <Ionicons name="trash" color={"#000"} size={18} />
              </PressableScale>
            )}
          </View>
        ))
      )}

      {/* Comment input */}
      <View
        style={{
          gap: 8,
          marginTop: 4,
        }}
      >
        <View
          style={{
            gap: 8,
            paddingTop: 8,
            marginTop: 8,
          }}
        >
          <Field
            value={comment}
            onChangeText={setComment}
            multiline={true}
            label="ADD COMMENT"
            placeholder="What a fish!"
            minHeight={120}
          />

          <View style={{ flexDirection: "row" }}>
            <PressableScale
              onPress={handleSendComment}
              disabled={!body}
              accessibilityRole="button"
              accessibilityLabel="Send comment"
              style={{
                flex: 1,
                backgroundColor: sendingComment ? "#ccc" : "#000",
                paddingHorizontal: 14,
                paddingVertical: 11,
                opacity: !body ? 0.3 : 1,
              }}
            >
              <InkText
                variant="button"
                style={{ color: "white", textAlign: "center" }}
              >
                {sendingComment ? "..." : "SHIP IT"}
              </InkText>
            </PressableScale>
          </View>
        </View>
      </View>
    </View>
  );
}
