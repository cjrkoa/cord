import { router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, Appearance } from "react-native";

import { useSession } from "../ctx";

export default function SignIn() {
  const { signIn } = useSession();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        return json["access_token"];
      } else {
        return response.status;
      }
    } catch (error) {
      return error;
    }
  };

  const handleSignInPress = async () => {
    const res: string | number = await handleSignIn(username, email, password);

    if (typeof res === "string") {
      signIn(res);
      Appearance.setColorScheme("dark");
      router.replace("/");
    } else console.log("Error: Couldn't Sign In");
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TextInput placeholder="username" onChangeText={setUsername} />
      <TextInput placeholder="email" onChangeText={setEmail} />
      <TextInput placeholder="password" onChangeText={setPassword} />
      <Text
        onPress={() => {
          handleSignInPress();
        }}
      >
        Sign In
      </Text>
      <Text
        onPress={() => {
          router.replace("/register");
        }}
      >
        Register
      </Text>
    </View>
  );
}
