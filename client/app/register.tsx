import {
  Text,
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";
import { CloseModalProps } from "@/utils/types";
import SERVER_ADDRESS from "@/constants/Connection";

export default function Register({ closeModal }: CloseModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const showAlert = () => {
    Alert.alert(
      "Invalid Email",
      "Please enter a valid email address",
      [{ text: "Okay", onPress: () => console.log("Ok Pressed") }],
      { cancelable: false }
    );
  };

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    if (
      email.includes("@") &&
      (email.includes(".com") ||
        email.includes(".org") ||
        email.includes(".edu") ||
        email.includes(".net"))
    ) {
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
    } else {
      return 400;
    }
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
          onPress={async (e) => {
            const response = await handleRegister(username, email, password);

            if (response >= 200 && response < 300) {
              closeModal();
            } else {
              showAlert();
            }
          }}
        >
          <Text style={styles.text}>Register</Text>
        </Pressable>
      </View>
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
  textInput: { color: Colors["dark"].text, fontSize: 20 },
  text: { color: Colors["dark"].text },
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
});
