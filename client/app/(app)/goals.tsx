import { Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoalContainer } from "@/components/Containers";

import { useSession } from "../../ctx";

export default function Goals() {
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
      }}
    >
      <ScrollView>
        <GoalContainer text={"Hello World"} backgroundColor={"#a97afa"} />
        <GoalContainer
          text={"Hello Worldjkasdkfhahjksdfjhkashdkjfakdkfjhlasklfkhj"}
          backgroundColor={"#a97afa"}
        />
        <GoalContainer text={"Hello World"} backgroundColor={"#a97afa"} />
        <GoalContainer text={"Hello World"} backgroundColor={"#a97afa"} />
        <GoalContainer text={"Hello World"} backgroundColor={"#a97afa"} />
        <Text
          onPress={() => {
            ping();
          }}
        >
          Get User
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
