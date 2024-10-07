import { router } from "expo-router";
import { useState } from "react";
import { Text, View, TextInput, Appearance } from "react-native";
import { Colors } from "@/constants/Colors";
import CordLogo from "@/components/CordLogo";

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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors["dark"].background,
      }}
    >
      <CordLogo paddingBottom={250} size={130} weight={400} />
      <TextInput
        style={{ color: Colors["dark"].text }}
        placeholder="username"
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={{ color: Colors["dark"].text }}
        placeholder="email"
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={{ color: Colors["dark"].text }}
        placeholder="password"
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <Text
        style={{ color: Colors["dark"].text }}
        onPress={() => {
          handleSignInPress();
        }}
      >
        Sign In
      </Text>
      <Text
        style={{ color: Colors["dark"].text }}
        onPress={() => {
          router.replace("/register");
        }}
      >
        Register
      </Text>
    </View>
  );
}
