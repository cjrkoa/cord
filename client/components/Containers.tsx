import { View, Text, ColorValue, FlexAlignType, FlexStyle } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

type ContainerProps = {
  text: string;
  textColor?: string | undefined;
  backgroundColor?: ColorValue | undefined;
  alignItems?: FlexAlignType | undefined;
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly"
    | undefined;
};

export const MessageContainer = (props: ContainerProps) => {
  const translateY = useSharedValue<number>(500);

  const handleAnimation = () => {
    translateY.value = withSequence(
      withTiming(10, { duration: 10 }),
      withSpring(0)
    );
  };
  const animatedStyles = useAnimatedStyle(() => ({
    alignItems: props.alignItems,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    handleAnimation();
  }, []);

  return (
    <Animated.View style={animatedStyles}>
      <View
        style={{
          maxWidth: "75%",
          flex: 1,
          flexDirection: "row",
          backgroundColor: props.backgroundColor,
          justifyContent: "center",
          paddingHorizontal: 10,
          paddingVertical: 15,
          borderRadius: 4,
          margin: 5,
          alignItems: props.alignItems,
        }}
      >
        <Text style={{ color: props.textColor }}>{props.text}</Text>
      </View>
    </Animated.View>
  );
};

export const GoalContainer = (props: ContainerProps) => {
  return (
    <View
      style={{
        maxWidth: "75%",
        height: "50%",
        flex: 1,
        flexDirection: "row",
        backgroundColor: props.backgroundColor,
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 15,
        borderRadius: 4,
        margin: 5,
        alignItems: props.alignItems,
      }}
    >
      <Text style={{ color: props.textColor }}>{props.text}</Text>
    </View>
  );
};
