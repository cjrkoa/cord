import { Text, ScrollView, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoalContainer } from "@/components/Containers";
import { Colors } from "@/constants/Colors";
import CordLogo from "@/components/CordLogo";

import { useSession } from "../../ctx";

export default function Goals() {
  const colorScheme = useColorScheme();
  const { session } = useSession();

  const ping = async () => {
    if (typeof session === "string") {
      const response = await fetch("http://127.0.0.1:5000/protected", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session}`,
        },
      });
      console.log(response);
    } else {
      console.log("session is null");
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? "dark"].background,
      }}
    >
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? "dark"].tabBarBackground,
          height: "10%",
          alignItems: "center",
        }}
      >
        <CordLogo paddingBottom={0} size={50} weight={400} />
      </View>
      <ScrollView>
        <GoalContainer
          text={"Hello World"}
          backgroundColor={"#a97afa"}
          textColor={Colors[colorScheme ?? "dark"].text}
        />
        <GoalContainer
          text={"Hello Worldjkasdkfhahjksdfjhkashdkjfakdkfjhlasklfkhj"}
          backgroundColor={"#a97afa"}
          textColor={Colors[colorScheme ?? "dark"].text}
        />
        <GoalContainer
          text={"Hello World"}
          backgroundColor={"#a97afa"}
          textColor={Colors[colorScheme ?? "dark"].text}
        />
        <GoalContainer
          text={"Hello World"}
          backgroundColor={"#a97afa"}
          textColor={Colors[colorScheme ?? "dark"].text}
        />
        <GoalContainer
          text={"Hello World"}
          backgroundColor={"#a97afa"}
          textColor={Colors[colorScheme ?? "dark"].text}
        />
        <Text
          style={{ color: Colors[colorScheme ?? "dark"].text }}
          onPress={() => {
            ping();
          }}
        >
          Get User
        </Text>
        <Text
          style={{ color: Colors[colorScheme ?? "dark"].text }}
          onPress={() => {
            console.log(colorScheme);
          }}
        >
          Get Color Scheme
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
