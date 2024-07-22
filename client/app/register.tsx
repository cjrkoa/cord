import { router } from "expo-router";
import { Text, View, TextInput } from "react-native";
import { useState } from "react";

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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput placeholder="username" onChangeText={setUsername} />
      <TextInput placeholder="email" onChangeText={setEmail} />
      <TextInput placeholder="password" onChangeText={setPassword} />
      <Text
        onPress={() => {
          console.log(handleRegister(username, email, password));
          router.replace("/sign-in");
        }}
      >
        Register
      </Text>
      <Text
        onPress={() => {
          router.replace("/sign-in");
        }}
      >
        Back to Sign In
      </Text>
    </View>
  );
}
