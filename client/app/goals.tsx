import { Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoalContainer from "@/components/containers/GoalContainer";

export default function Goals() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ScrollView>
        <GoalContainer text={"Hello World"} />
        <GoalContainer text={"Hello World"} />
        <GoalContainer text={"Hello World"} />
        <GoalContainer text={"Hello World"} />
        <GoalContainer text={"Hello World"} />
      </ScrollView>
    </SafeAreaView>
  );
}
