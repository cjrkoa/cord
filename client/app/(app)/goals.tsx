import { Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoalContainer } from "@/components/Containers";

export default function Goals() {
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
      </ScrollView>
    </SafeAreaView>
  );
}
