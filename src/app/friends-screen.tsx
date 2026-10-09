import { Avatar } from "@/components/Avatar";
import Field from "@/components/Field";
import { InkText } from "@/components/InkText";
import {
  fetchFriendSearchResults,
  getFriendRequest,
  handleAcceptRequest,
  sendFriendRequest,
} from "@/logic/friends";
import { router } from "expo-router";
import { PressableScale } from "pressto";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

type FriendshipStatus = "pending" | "accepted";

type FriendSearchResult = {
  id: string;
  username: string;
  avatar_path: string | null;
  friendship_status: FriendshipStatus | null;
  requested_by: string | null;
};

type FriendRequest = {
  friendship_id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_path: string | null;
  requested_at: string;
};

export default function FriendsScreen() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<FriendSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [requests, setRequests] = useState<FriendRequest[]>([]);

  const searchFriends = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setSearchResult([]);
      return;
    }

    setIsSearching(true);
    const data = await fetchFriendSearchResults(trimmedQuery);
    setSearchResult(data ?? []);
    setIsSearching(false);
  }, []);

  const loadFriendRequests = useCallback(async () => {
    const data = await getFriendRequest();
    setRequests(data ?? []);
  }, []);

  useEffect(() => {
    void loadFriendRequests();
  }, [loadFriendRequests]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchFriends(search);
    }, 350);

    return () => clearTimeout(timeout);
  }, [search, searchFriends]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await searchFriends(search);
    setRefreshing(false);
  }, [search, searchFriends]);

  async function handleSendRequest(userId: string) {
    sendFriendRequest(userId);
    onRefresh();
    router.back();
  }

  async function handleAcceptFriend(userId: string) {
    await handleAcceptRequest(userId);
    onRefresh();
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
      <InkText variant="sectionLabel" style={{ fontSize: 18, lineHeight: 28 }}>
        Search friends by username
      </InkText>
      <View style={{ flex: 1, paddingTop: 20 }}>
        {isSearching ? (
          <ActivityIndicator color="#000" />
        ) : search.trim().length < 2 ? (
          <InkText variant="caption">
            Enter at least 2 characters to search.
          </InkText>
        ) : searchResult.length === 0 ? (
          <InkText variant="caption">No users found.</InkText>
        ) : (
          <ScrollView
            contentContainerStyle={{
              gap: 12,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps={"handled"}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                progressBackgroundColor="#000"
                tintColor="#000"
              />
            }
          >
            {searchResult.map((user) => (
              <View
                key={user.id}
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderColor: "#ccc",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Avatar path={user.avatar_path} username={user.username} />
                  <InkText variant="button">@{user.username}</InkText>
                </View>

                {user.friendship_status === "accepted" ? (
                  <InkText variant="caption">You're friends</InkText>
                ) : user.friendship_status === "pending" ? (
                  <InkText variant="caption">
                    {user.requested_by === user.id
                      ? "Requested you"
                      : "Request sent"}
                  </InkText>
                ) : (
                  <PressableScale onPress={() => handleSendRequest(user.id)}>
                    <InkText variant="button">Add</InkText>
                  </PressableScale>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      {requests.length > 0 && (
        <View style={{ gap: 12 }}>
          <InkText variant="sectionLabel">FRIEND REQUESTS</InkText>

          {requests.map((request) => (
            <View
              key={request.friendship_id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: "#e5e5e5",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Avatar
                  path={request.avatar_path}
                  username={request.username}
                  size={40}
                />

                <InkText variant="button">@{request.username}</InkText>
              </View>

              <PressableScale
                onPress={() => handleAcceptFriend(request.user_id)}
                style={{
                  backgroundColor: "#000",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <InkText variant="button" style={{ color: "#fff" }}>
                  ACCEPT
                </InkText>
              </PressableScale>
            </View>
          ))}
        </View>
      )}

      <Field
        value={search}
        label="Search"
        onChangeText={setSearch}
        placeholder="Friends username"
      />
    </KeyboardAvoidingView>
  );
}
