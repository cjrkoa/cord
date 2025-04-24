import {
  Text,
  View,
  Switch,
  Appearance,
  useColorScheme,
  Modal,
  TextInput,
  Platform,
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
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, signOut, session, refreshSession } = useSession();

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Colors[colorScheme ?? "dark"].background,
    },
    signOutButtonContainer: {
      backgroundColor: "red",
      padding: 10,
      width: "45%",
      margin: 10,
      borderWidth: 2,
      borderRadius: 20,
      borderColor: Colors[colorScheme ?? "dark"].tint,
      alignItems: "center",
      justifyContent: "center",
    },
    signOutText: {
      color: Colors[colorScheme ?? "dark"].text,
      fontWeight: "bold",
    },
    feedbackButtonContainer: {
      backgroundColor: Colors[colorScheme ?? "dark"].textInput,
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderRadius: 5,
      width: "100%",
      borderColor: Colors[colorScheme ?? "dark"].tint,
    },
    switchContainer: {
      flexDirection: "row",
      verticalAlign: "bottom",
      alignItems: "stretch",
      padding: 10,
    },
    modal: {
      backgroundColor: Colors[colorScheme ?? "dark"].background,
    },
    text: {
      color: Colors[colorScheme ?? "dark"].text,
    },
  });

  const inModalStyles = StyleSheet.create({
    textInput: {
      textAlignVertical: "top",
      margin: 5,
      color: Colors[colorScheme ?? "dark"].text,
    },
    textInputContainer: {
      width: "90%",
      height: "65%",
      backgroundColor: Colors[colorScheme ?? "dark"].textInput,
      borderColor: Colors[colorScheme ?? "dark"].tint,
      borderWidth: 2.5,
      borderRadius: 5,
      marginBottom: 25,
      color: Colors[colorScheme ?? "dark"].text,
    },
    mainContainer: {
      backgroundColor: Colors[colorScheme ?? "dark"].background,
      paddingTop: Platform.OS === "ios" ? 20 : 0,
      alignItems: "center",
      flex: 1,
    },
    subContainer: {
      backgroundColor: Colors[colorScheme ?? "dark"].tabBarBackground,
      marginBottom: 25,
      width: "100%",
      alignItems: "center",
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "center",
    },
    buttonTextLeft: {
      paddingRight: 50,
      color: Colors[colorScheme ?? "dark"].text,
    },
    buttonTextRight: {
      paddingLeft: 50,
      color: Colors[colorScheme ?? "dark"].text,
    },
    feedbackText: {
      color: Colors["dark"].text,
      paddingBottom: 10,
      paddingTop: 5,
      marginHorizontal: 20,
    },
    title: {
      color: Colors["dark"].text,
      fontWeight: "bold",
      alignSelf: "center",
      paddingTop: 10,
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

  const uploadFeedback = async () => {
    try {
      const response = await fetch(SERVER_ADDRESS + "upload_feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session}`,
        },
        body: JSON.stringify({
          feedback: feedback,
        }),
      });
      if (response.ok) {
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.text}>Color Scheme</Text>
      <View style={styles.switchContainer}>
        <Switch
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
      <View>
        <Pressable style={styles.feedbackButtonContainer}>
          <Text
            style={styles.text}
            onPress={() => {
              setFeedbackModalVisible(true);
            }}
          >
            Give Feedback
          </Text>
        </Pressable>
      </View>
      <View>
        <Pressable style={styles.signOutButtonContainer}>
          <Text
            style={styles.signOutText}
            onPress={() => {
              // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
              signOut();
            }}
          >
            Sign Out
          </Text>
        </Pressable>
      </View>
      <View>
        <Pressable style={styles.feedbackButtonContainer}>
          <Text
            style={styles.text}
            onPress={() => {
              setDeleteModalVisible(true);
            }}
          >
            Delete Account
          </Text>
        </Pressable>
        <Modal
          animationType="slide"
          transparent={false}
          visible={deleteModalVisible}
          style={styles.modal}
          onRequestClose={() => {
            setDeleteModalVisible(!feedbackModalVisible);
          }}
        >
          <View style={deleteStyles.mainContainer}>
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
            <Text
              style={deleteStyles.text}
              onPress={() => {
                handleSignInPress();
                setDeleteModalVisible(false);
                signOut();
              }}
            >
              Delete Account
            </Text>
            <Text
              style={styles.text}
              onPress={() => {
                setDeleteModalVisible(false);
              }}
            >
              Cancel
            </Text>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={false}
          visible={feedbackModalVisible}
          style={styles.modal}
          onRequestClose={() => {
            setFeedbackModalVisible(!feedbackModalVisible);
          }}
        >
          <View style={inModalStyles.mainContainer}>
            <View style={inModalStyles.subContainer}>
              <Text style={inModalStyles.title}>Feedback</Text>
              <Text style={inModalStyles.feedbackText}>
                Thank you for taking the time to share your feedback! Your input
                is incredibly valuable in helping us better understand your
                needs and continue improving to provide the best possible
                experience. :)
              </Text>
            </View>
            <View style={inModalStyles.buttonContainer}>
              <Text
                style={inModalStyles.buttonTextLeft}
                onPress={() => {
                  setFeedbackModalVisible(false);
                }}
              >
                Cancel
              </Text>
              <Text
                style={inModalStyles.buttonTextRight}
                onPress={async () => {
                  const success = await uploadFeedback(); // Wait for the result of uploadFeedback
                  if (!success) {
                    const refreshed = await refreshSession(); // Attempt to refresh the session
                    if (refreshed) {
                      await uploadFeedback(); // Retry uploading feedback if session refresh succeeds
                    }
                  }
                  setFeedbackModalVisible(false);
                }}
              >
                Submit
              </Text>
            </View>
            <View style={inModalStyles.textInputContainer}>
              <TextInput
                onChangeText={setFeedback}
                style={inModalStyles.textInput}
                multiline={true}
              />
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}
