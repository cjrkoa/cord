import { router } from "expo-router";
import { Text, View, TextInput, useColorScheme } from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import CordLogo from "@/components/CordLogo";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    const response = await fetch("http://127.0.0.1:5000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        lastInteraction: null,
      }),
    });
    return response.status;
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors["dark"].background,
      }}
    >
      <CordLogo paddingBottom={250} size={130} weight={400} />
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: Colors["dark"].background,
          borderColor: Colors["dark"].tint,
          borderWidth: 1,
          borderRadius: 0,
          padding: 5,
          margin: 2.5,
          width: "75%",
          height: "7.5%",
        }}
      >
        <TextInput
          style={{ color: Colors["dark"].text, fontSize: 30 }}
          placeholder="username"
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: Colors["dark"].textInput,
          borderColor: Colors["dark"].tint,
          borderWidth: 1,
          borderRadius: 0,
          padding: 5,
          margin: 2.5,
          width: "75%",
          height: "7.5%",
        }}
      >
        <TextInput
          style={{ color: Colors["dark"].text, fontSize: 30 }}
          placeholder="email"
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: Colors["dark"].textInput,
          borderColor: Colors["dark"].tint,
          borderWidth: 1,
          borderRadius: 0,
          padding: 5,
          margin: 2.5,
          width: "75%",
          height: "7.5%",
        }}
      >
        <TextInput
          style={{ color: Colors["dark"].text, fontSize: 30 }}
          placeholder="password"
          onChangeText={setPassword}
          autoCapitalize="none"
        />
      </View>
      <Text
        style={{ color: Colors["dark"].text }}
        onPress={() => {
          console.log(handleRegister(username, email, password));
          router.replace("/sign-in");
        }}
      >
        Register
      </Text>
      <Text
        style={{ color: Colors["dark"].text }}
        onPress={() => {
          router.replace("/sign-in");
        }}
      >
        Back to Sign In
      </Text>
    </View>
  );
}
