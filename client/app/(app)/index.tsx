import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  ScrollView,
  useColorScheme,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MessageContainer } from "@/components/Containers";
import { SafeAreaView } from "react-native-safe-area-context";
import { Message, MessageSchema } from "@/utils/types";
import { Colors } from "@/constants/Colors";
import CordLogo from "@/components/CordLogo";
import { setItem, getChatlog, clear } from "@/utils/AsyncStorage";
import { filterOnlyUserInputs } from "@/utils/functions";
import SERVER_ADDRESS from "@/constants/Connection";
import { useSession } from "../../ctx";

export default function Index() {
  const { getUsername, session, refreshSession, signOut } = useSession();
  const username = getUsername();
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Message[]>([]);
  const [userChats, setUserChats] = useState<Message[]>([]);

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? "dark"].tabBarBackground,
    },
    subContainer: {
      backgroundColor: Colors[colorScheme ?? "dark"].tabBarBackground,
      height: "10%",
      alignItems: "center",
    },
    chatContainer: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? "dark"].background,
    },
    textInputContainer: {
      flexDirection: "row",
      backgroundColor: Colors[colorScheme ?? "dark"].textInput,
      borderColor: Colors[colorScheme ?? "dark"].tint,
      borderWidth: 1,
      borderRadius: 50,
      padding: 5,
      margin: 10,
      maxHeight: "45%",
    },
    textInput: {
      padding: 15,
      width: "90%",
      color: Colors[colorScheme ?? "dark"].text,
    },
    text: {
      color: "blue",
      fontSize: 25,
      verticalAlign: "middle",
    },
  });

  const getEmotionMetadata = async (input: string) => {
    try {
      const response = await fetch(SERVER_ADDRESS + "evaluate_text_emotion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session}`,
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const json = await response.json();
      console.log(json);
      return json;
    } catch (error) {
      console.error("Error: " + error);
      return false;
    }
  };

  const messageChatbot = useCallback(
    async (input: string) => {
      try {
        let updatedUserChats: Message[] = [];

        setChats((prevChats: Message[]) => {
          updatedUserChats = [
            ...prevChats,
            { id: prevChats.length, type: "user", text: input },
          ];
          return updatedUserChats;
        });

        await new Promise((resolve) => setTimeout(resolve, 1250));

        const response = await fetch(SERVER_ADDRESS + "chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session}`,
          },
          body: JSON.stringify({
            message: input,
            memory: updatedUserChats,
            username: username,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const json = await response.json();
        console.log(json);

        json["message"].forEach((message: string, index: number) => {
          setChats((prevChats: Message[]) => {
            const updatedChats = [
              ...prevChats,
              {
                id: prevChats.length,
                type: "bot",
                text: message,
              },
            ];
            return updatedChats;
          });
        });

        return true;
      } catch (error) {
        console.error("Error: " + error);
        setChats((prevChats) => [
          ...prevChats,
          {
            id: prevChats.length,
            type: "error",
            text: "Something went wrong!",
          },
        ]);
        return false;
      }
    },
    [chats]
  );

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chats]);

  useEffect(() => {
    const fetchChatlog = async () => {
      const chatlog = await getChatlog();
      if (chatlog) {
        setChats(chatlog);
      }
    };

    fetchChatlog();
    console.log("fetched");
  }, []);

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.subContainer}>
        <CordLogo paddingBottom={0} size={50} weight={400} />
      </View>
      <ScrollView
        style={styles.chatContainer}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {Array.isArray(chats) ? (
          chats.map((data: Message, i: number) => (
            <MessageContainer
              key={i}
              text={data.text}
              textColor={
                data.type === "bot" ? Colors["dark"].text : Colors["light"].text
              }
              backgroundColor={data.type === "bot" ? "#a97afa" : "white"}
              alignItems={data.type === "bot" ? "flex-start" : "flex-end"}
            />
          ))
        ) : (
          <MessageContainer
            text={
              "There was an error loading the chats.\n" +
              "Type: " +
              typeof chats +
              "\nChatlog: " +
              chats["0"]
            }
            backgroundColor={"#a97afa"}
            alignItems="flex-start"
          />
        )}
      </ScrollView>
      <KeyboardAvoidingView
        style={styles.textInputContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TextInput
          style={styles.textInput}
          onChangeText={setInput}
          value={input}
          onSubmitEditing={async (e) => {
            if (input.trim().length > 0) {
              const success = await messageChatbot(input);

              if (!success) {
                const refreshed = await refreshSession();
                if (refreshed) {
                  await messageChatbot(input);
                } else {
                  signOut();
                }
              }
              await setItem("chatlog", chats).then(() =>
                console.log("chatlog saved")
              );
              setInput("");
            }
          }}
          placeholder="Enter your Message Here..."
        />
        <View style={{ justifyContent: "center" }}>
          <Text
            style={styles.text}
            onPress={async (e) => {
              if (input == "CLEAR") {
                await clear().then(() => setChats([]));
              } else if (input.trim().length > 0) {
                const success = await messageChatbot(input);

                if (!success) {
                  const refreshed = await refreshSession();
                  if (refreshed) {
                    await messageChatbot(input);
                  } else {
                    signOut();
                  }
                }
                await setItem("chatlog", chats).then(() =>
                  console.log("chatlog saved")
                );
                setInput("");
              }
            }}
          >
            ◯
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
