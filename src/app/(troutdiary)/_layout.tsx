import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TroutDiaryLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "fish",
            selected: "fish.fill",
          }}
        />
        <NativeTabs.Trigger.Label>CATCH</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="feed">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "list.bullet",
            selected: "list.bullet",
          }}
        />
        <NativeTabs.Trigger.Label>FEED</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon
          sf={{
            default: "person",
            selected: "person.fill",
          }}
        />
        <NativeTabs.Trigger.Label>PROFILE</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
