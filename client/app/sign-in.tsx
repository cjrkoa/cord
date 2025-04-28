import { router } from "expo-router";
import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  Appearance,
  useColorScheme,
  StyleSheet,
  Pressable,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { CloseModalProps } from "@/utils/types";
import { AuthResponse } from "@/utils/types";

import { useSession } from "../ctx";
import SERVER_ADDRESS from "@/constants/Connection";

export default function SignIn({ closeModal }: CloseModalProps) {
  const { signIn, storeRefreshToken, storeUsername } = useSession();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (username: string, password: string) => {
    try {
      const response = await fetch(SERVER_ADDRESS + "login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const json: AuthResponse = await response.json();
        return json;
      } else {
        return response.status;
      }
    } catch (error) {
      return error;
    }
  };

  const handleSignInPress = async () => {
    const res: AuthResponse | number | unknown = await handleSignIn(
      username,
      password
    );

    if (
      typeof res === "object" &&
      res != null &&
      "access_token" in res &&
      "refresh_token" in res &&
      typeof res.access_token === "string" &&
      typeof res.refresh_token === "string"
    ) {
      signIn(res.access_token);
      storeRefreshToken(res.refresh_token);
      storeUsername(username);
      Appearance.setColorScheme("dark");
      router.replace("/");
    } else console.log("Error: Couldn't Sign In");
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.spacer} />
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="username"
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.textInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="password"
          onChangeText={setPassword}
          autoCapitalize="none"
        />
      </View>
      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.pressable}
          onPress={() => {
            closeModal();
          }}
        >
          <Text style={styles.text}>Cancel</Text>
        </Pressable>
        <Pressable
          style={styles.pressable}
          onPress={() => {
            handleSignInPress();
            closeModal();
          }}
        >
          <Text style={styles.text}>Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: { color: Colors["dark"].text, fontSize: 20 },
  textInputContainer: {
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
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors["dark"].tabBarBackground,
  },
  spacer: {
    height: "40%",
  },
  buttonsContainer: {
    height: "40%",
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
  },
  pressable: {
    backgroundColor: Colors["dark"].background,
    width: "35%",
    height: "15%",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    marginTop: 10,
    borderColor: Colors["dark"].tint,
    borderWidth: 2,
    borderRadius: 20,
  },
  text: { color: Colors["dark"].text },
});
