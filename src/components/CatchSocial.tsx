import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

import {
  addCatchComment,
  deleteCatchComment,
  getCatchComments,
  getCatchLikes,
  likeCatch,
  unlikeCatch,
} from "@/logic/catches";
import { useCommentStore } from "@/logic/useCommentStore";
import { supabase } from "@/supabase/client";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { InkText } from "./InkText";

type Comment = {
  id: string;
  body: string;
  user_id: string;
  comment_by: string;
};

type CatchSocialProps = {
  catchId: string;
  username: string | null;
  refreshKey: number;
};

export default function CatchSocial({
  catchId,
  username,
  refreshKey,
}: CatchSocialProps) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);

  const commentText = useCommentStore(
    (state) => state.commentsByCatchId[catchId] ?? "",
  );
  const setCommentText = useCommentStore((state) => state.setCommentText);
  const clearCommentText = useCommentStore((state) => state.clearCommentText);

  const [loading, setLoading] = useState(true);
  const [savingLike, setSavingLike] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    void loadData();
  }, [catchId, refreshKey]);

  async function loadData() {
    try {
      setLoading(true);

      const [
        {
          data: { user },
        },
        likes,
        loadedComments,
      ] = await Promise.all([
        supabase.auth.getUser(),
        getCatchLikes(catchId),
        getCatchComments(catchId),
      ]);

      setCurrentUserId(user?.id ?? null);
      setLikeCount(likes.count);
      setLikedByMe(likes.likedByCurrentUser);
      setComments(
        loadedComments.map((comment: any) => ({
          id: comment.id,
          body: comment.body,
          user_id: comment.user_id,
          comment_by: comment.comment_by,
        })) as Comment[],
      );
    } catch (error) {
      console.warn("Could not load likes or comments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike() {
    if (savingLike) {
      return;
    }

    try {
      setSavingLike(true);

      if (likedByMe) {
        await unlikeCatch(catchId);
        setLikedByMe(false);
        setLikeCount((count) => Math.max(0, count - 1));
      } else {
        await likeCatch(catchId);
        setLikedByMe(true);
        setLikeCount((count) => count + 1);
      }
    } catch (error) {
      Alert.alert(
        "Could not update like",
        error instanceof Error ? error.message : "Please try again.",
      );

      await loadData();
    } finally {
      setSavingLike(false);
    }
  }

  async function handleSendComment() {
    const body = commentText.trim();

    if (!username || !body || sendingComment) {
      return;
    }

    try {
      setSendingComment(true);

      await addCatchComment(catchId, username, body);

      clearCommentText(catchId);
      await loadData();
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

            setComments((current) =>
              current.filter((comment) => comment.id !== commentId),
            );
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

  if (loading) {
    return <InkText variant="caption">Loading activity...</InkText>;
  }

  return (
    <View style={{ marginTop: 12 }}>
      {/* Like and comment buttons */}
      <View style={{ flexDirection: "row", gap: 20 }}>
        <PressableScale
          onPress={handleLike}
          disabled={savingLike}
          accessibilityRole="button"
          accessibilityLabel={likedByMe ? "Unlike catch" : "Like catch"}
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <InkText variant="caption">{likeCount}</InkText>
          <Ionicons
            name={likedByMe ? "heart" : "heart-outline"}
            color={likedByMe ? "#e21616" : "#000"}
            size={18}
          />
        </PressableScale>

        <PressableScale
          onPress={() => setShowComments((current) => !current)}
          accessibilityRole="button"
          accessibilityLabel="Show comments"
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
        >
          <InkText variant="caption">{comments.length}</InkText>
          <Ionicons
            name={showComments ? "chatbox" : "chatbox-outline"}
            size={18}
          />
        </PressableScale>
      </View>

      {/* Comments */}
      {showComments && (
        <View style={{ marginTop: 14 }}>
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
                  borderColor:
                    idx + 1 === comments.length ? "transparent" : "#ccc",
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 6,
                    }}
                  >
                    <Ionicons name="person" size={16} />
                    <InkText variant="sectionLabel" style={{ marginBottom: 8 }}>
                      {comment.comment_by}
                    </InkText>
                  </View>

                  <InkText variant="caption">{comment.body}</InkText>
                </View>

                {comment.user_id === currentUserId && (
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
            {commentText.length > 0 ? (
              <View
                style={{
                  gap: 8,
                  paddingTop: 8,
                  marginTop: 8,
                  borderTopWidth: 1,
                  borderColor: "#ccc",
                }}
              >
                <InkText variant="sectionLabel" style={{ fontSize: 16 }}>
                  DRAFT:
                </InkText>
                <InkText variant="caption">"{commentText}"</InkText>

                <View style={{ flexDirection: "row" }}>
                  <PressableScale
                    onPress={handleSendComment}
                    disabled={sendingComment}
                    accessibilityRole="button"
                    accessibilityLabel="Send comment"
                    style={{
                      flex: 1,
                      backgroundColor: sendingComment ? "#ccc" : "#000",
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                    }}
                  >
                    <InkText
                      variant="button"
                      style={{ color: "white", textAlign: "center" }}
                    >
                      {sendingComment ? "..." : "SHIP IT"}
                    </InkText>
                  </PressableScale>
                  <PressableScale
                    onPress={() => clearCommentText(catchId)}
                    accessibilityRole="button"
                    accessibilityLabel="Discard comment"
                    style={{
                      flex: 1,
                      backgroundColor: "#a00000",
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                    }}
                  >
                    <InkText variant="button" style={{ textAlign: "center" }}>
                      DISCARD
                    </InkText>
                  </PressableScale>
                </View>
              </View>
            ) : (
              <PressableScale
                style={{
                  borderWidth: 1,
                  borderColor: "#000",
                  paddingHorizontal: 14,
                  paddingVertical: 11,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/comment-screen",
                    params: { catchId },
                  })
                }
              >
                <InkText variant="button" style={{ textAlign: "center" }}>
                  WRITE COMMENT
                </InkText>
              </PressableScale>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
