import { View, Text } from "react-native";

type GoalProps = {
  text: string;
};

const GoalContainer = (props: GoalProps) => {
  return (
    <View>
      <Text>{props.text}</Text>
    </View>
  );
};

export default GoalContainer;
