import { Text, View } from "react-native";

type CordLogoProps = {
  paddingBottom: number;
  size: number;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
};

export default function CordLogo(props: CordLogoProps) {
  return (
    <View style={{ flexDirection: "row", paddingBottom: props.paddingBottom }}>
      <Text
        style={{
          color: "#aa2bff",
          fontSize: props.size,
          fontWeight: props.weight,
        }}
      >
        Co
      </Text>
      <Text
        style={{
          color: "#0e9e92",
          fontSize: props.size,
          fontWeight: props.weight,
        }}
      >
        rd
      </Text>
    </View>
  );
}
