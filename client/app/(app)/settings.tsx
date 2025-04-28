import {
  Text,
  View,
  Switch,
  Appearance,
  useColorScheme,
  Modal,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";

import { useSession } from "../../ctx";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthResponse } from "@/utils/types";

import SERVER_ADDRESS from "@/constants/Connection";

export default function Settings() {
  const colorScheme = useColorScheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { signOut, session, refreshSession } = useSession();

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[colorScheme ?? "dark"].background,
    },
    deleteButtonContainer: {
      backgroundColor: "red",
      padding: 10,
      width: "50%",
      height: "10%",
      margin: 10,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: Colors[colorScheme ?? "dark"].tint,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteButtonText: {
      color: Colors[colorScheme ?? "dark"].text,
      fontWeight: "bold",
    },
    signOutButtonContainer: {
      backgroundColor: Colors[colorScheme ?? "dark"].textInput,
      padding: 10,
      width: "50%",
      height: "10%",
      margin: 10,
      borderWidth: 1,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      borderColor: Colors[colorScheme ?? "dark"].tint,
    },
    modal: {
      backgroundColor: Colors[colorScheme ?? "dark"].background,
    },
    text: {
      color: Colors[colorScheme ?? "dark"].text,
    },
    buttonsContainer: {
      flex: 1,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const deleteStyles = StyleSheet.create({
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
    text: { color: Colors["dark"].text },
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
    spacer: {
      height: "40%",
    },
    buttonsContainer: {
      height: "40%",
      flexDirection: "row",
      justifyContent: "center",
      alignContent: "center",
    },
  });

  const toggleSwitch = () => {
    setIsEnabled((state) => !state);
    Appearance.setColorScheme(isEnabled ? "dark" : "light");
  };

  // TODO: refactor code eventually so this handlesignin isn't copy/pasted twice
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
      const response = await fetch(SERVER_ADDRESS + "delete_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${res.access_token}`,
        },
        body: JSON.stringify({
          username,
        }),
      });
    } else console.log("Error: Couldn't Sign In");
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.buttonsContainer}>
        <Pressable
          style={styles.signOutButtonContainer}
          onPress={() => {
            toggleSwitch();
          }}
        >
          <Text style={styles.text}>
            {Appearance.getColorScheme() === "dark"
              ? "Dark Mode"
              : "Light Mode"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.signOutButtonContainer}
          onPress={() => {
            // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
            signOut();
          }}
        >
          <Text style={styles.text}>Sign Out</Text>
        </Pressable>
        <Pressable
          style={styles.deleteButtonContainer}
          onPress={() => {
            setDeleteModalVisible(true);
          }}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </Pressable>
        <Modal
          animationType="slide"
          transparent={false}
          visible={deleteModalVisible}
          style={styles.modal}
          onRequestClose={() => {
            setDeleteModalVisible(!deleteModalVisible);
          }}
        >
          <View style={deleteStyles.mainContainer}>
            <View style={deleteStyles.spacer} />
            <View style={deleteStyles.textInputContainer}>
              <TextInput
                style={deleteStyles.textInput}
                placeholder="username"
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            <View style={deleteStyles.textInputContainer}>
              <TextInput
                style={deleteStyles.textInput}
                placeholder="password"
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>
            <View style={deleteStyles.buttonsContainer}>
              <Pressable
                style={deleteStyles.pressable}
                onPress={() => {
                  setDeleteModalVisible(false);
                }}
              >
                <Text style={styles.text}>Cancel</Text>
              </Pressable>
              <Pressable
                style={deleteStyles.pressable}
                onPress={() => {
                  handleSignInPress();
                  setDeleteModalVisible(false);
                  signOut();
                }}
              >
                <Text style={deleteStyles.text}>Delete Account</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
