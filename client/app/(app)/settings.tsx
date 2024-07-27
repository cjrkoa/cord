import { Text, View, Switch, Appearance, useColorScheme } from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";

import { useSession } from "../../ctx";

export default function Settings() {
  const colorScheme = useColorScheme();
  const [isEnabled, setIsEnabled] = useState(true);
  const { signOut } = useSession();

  const toggleSwitch = () => {
    setIsEnabled((state) => !state);
    Appearance.setColorScheme(isEnabled ? "light" : "dark");
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors[colorScheme ?? "dark"].background,
      }}
    >
      <View>
        <Switch
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
      <Text
        style={{ color: Colors[colorScheme ?? "dark"].text }}
        onPress={() => {
          // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
          signOut();
        }}
      >
        Sign Out
      </Text>
    </View>
  );
}
