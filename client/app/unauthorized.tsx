import { router } from "expo-router";
import { useState } from "react";
import {
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Appearance,
  useColorScheme,
  Modal,
  View,
  Pressable,
} from "react-native";
import { Colors } from "@/constants/Colors";
import CordLogo from "@/components/CordLogo";
import Register from "./register";
import SignIn from "./sign-in";

export default function Unauthorized() {
  const [signInVisible, setSignInVisible] = useState(false);
  const [registerVisible, setRegisterVisible] = useState(false);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <CordLogo paddingBottom={250} size={130} weight={400} />
      <View style={styles.subContainer}>
        <Pressable
          style={styles.pressable}
          onPress={() => {
            setSignInVisible(false);
            setRegisterVisible(true);
          }}
        >
          <Text style={styles.text}>Register</Text>
        </Pressable>
        <Pressable
          style={styles.pressable}
          onPress={() => {
            setRegisterVisible(false);
            setSignInVisible(true);
          }}
        >
          <Text style={styles.text}>Login</Text>
        </Pressable>
      </View>
      <Modal
        animationType="slide"
        transparent={false}
        visible={registerVisible}
        style={styles.modal}
        onRequestClose={() => {
          setRegisterVisible(!registerVisible);
        }}
      >
        <Register closeModal={() => setRegisterVisible(false)} />
      </Modal>
      <Modal
        animationType="slide"
        transparent={false}
        visible={signInVisible}
        style={styles.modal}
        onRequestClose={() => {
          setSignInVisible(!signInVisible);
        }}
      >
        <SignIn closeModal={() => setSignInVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pressable: {
    backgroundColor: Colors["dark"].tabBarBackground,
    width: "35%",
    height: "25%",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    borderColor: Colors["dark"].tint,
    borderWidth: 2,
    borderRadius: 20,
  },
  text: {
    color: Colors["dark"].text,
    fontSize: 20,
    fontWeight: "bold",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors["dark"].background,
  },
  subContainer: {
    flex: 1,
    flexDirection: "row",
  },
  modal: {
    backgroundColor: Colors["dark"].background,
  },
});
