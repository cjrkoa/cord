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
} from "react-native";
import { useState } from "react";
import { Colors } from "@/constants/Colors";

import { useSession } from "../../ctx";
import { SafeAreaView } from "react-native-safe-area-context";

import SERVER_ADDRESS from "@/constants/Connection";

export default function Settings() {
  const colorScheme = useColorScheme();
  const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { signOut, session, refreshSession } = useSession();

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
      marginTop: "50%",
      width: "45%",
      height: "10%",
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
      margin: 20,
      borderWidth: 1,
      borderRadius: 5,
      height: "10%",
      width: "45%",
      borderColor: Colors[colorScheme ?? "dark"].tint,
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
      width: "90%",
      height: "65%",
      textAlignVertical: "top",
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

  const toggleSwitch = () => {
    setIsEnabled((state) => !state);
    Appearance.setColorScheme(isEnabled ? "dark" : "light");
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
      <View>
        <Switch
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
      <View style={styles.feedbackButtonContainer}>
        <Text
          style={styles.text}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          Give Feedback
        </Text>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          style={styles.modal}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
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
            <TextInput
              style={inModalStyles.textInput}
              onChangeText={setFeedback}
              multiline={true}
            />
            <View style={inModalStyles.buttonContainer}>
              <Text
                style={inModalStyles.buttonTextLeft}
                onPress={() => {
                  setModalVisible(false);
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
                  setModalVisible(false);
                }}
              >
                Submit
              </Text>
            </View>
          </View>
        </Modal>
      </View>
      <View style={styles.signOutButtonContainer}>
        <Text
          style={styles.signOutText}
          onPress={() => {
            // The `app/(app)/_layout.tsx` will redirect to the sign-in screen.
            signOut();
          }}
        >
          Sign Out
        </Text>
      </View>
    </View>
  );
}
