import { router } from "expo-router";
import {
  Text,
  View,
  TextInput,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { CloseModalProps } from "@/utils/types";
import SERVER_ADDRESS from "@/constants/Connection";

export default function Register({ closeModal }: CloseModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    const response = await fetch(SERVER_ADDRESS + "register", {
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
    <View style={styles.mainContainer}>
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
          placeholder="email"
          onChangeText={setEmail}
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
      <Text
        style={styles.text}
        onPress={() => {
          console.log(handleRegister(username, email, password));
          closeModal();
        }}
      >
        Register
      </Text>
      <Text
        style={styles.text}
        onPress={() => {
          closeModal();
        }}
      >
        Cancel
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  textInput: { color: Colors["dark"].text, fontSize: 30 },
  text: { color: Colors["dark"].text },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors["dark"].tabBarBackground,
  },
});
