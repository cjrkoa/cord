import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  ScrollView,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { MessageContainer } from "@/components/Containers";
import { SafeAreaView } from "react-native-safe-area-context";
import { Message, MessageSchema } from "@/utils/types";
import { Colors } from "@/constants/Colors";
import CordLogo from "@/components/CordLogo";
import { mergeItem, getItem, getChatlog, clear } from "@/utils/AsyncStorage";
import { filterOnlyUserInputs } from "@/utils/functions";
import SERVER_ADDRESS from "@/constants/Connection";

export default function Index() {
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Message[]>([]);

  const styles = StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: Colors[colorScheme ?? "dark"].background,
    },
    subContainer: {
      backgroundColor: Colors[colorScheme ?? "dark"].tabBarBackground,
      height: "10%",
      alignItems: "center",
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

  const dummyChatbot = useCallback(
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

        setChats((prevChats: Message[]) => {
          const updatedChats = [
            ...prevChats,
            {
              id: prevChats.length,
              type: "bot",
              text: "Test Response so I don't have to call OpenAI's API",
            },
          ];
          return updatedChats;
        });

        return {
          id: chats.length,
          type: "bot",
          text: "Test Response so I don't have to call OpenAI's API",
        };
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
      }
    },
    [chats]
  );

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

        //const trimmedChats = await filterOnlyUserInputs(updatedUserChats);

        const response = await fetch(SERVER_ADDRESS + "chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
            memory: updatedUserChats,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const json = await response.json();
        console.log(json);

        setChats((prevChats: Message[]) => {
          const updatedChats = [
            ...prevChats,
            {
              id: prevChats.length,
              type: "bot",
              text: json["message"],
            },
          ];
          return updatedChats;
        });

        return json["message"];
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
      }
    },
    [chats]
  );

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chats]);

  /*useEffect(() => {
    const fetchChatlog = async () => {
      const chatlog = await getChatlog();
      if (chatlog) {
        setChats(chatlog);
      }
    };

    fetchChatlog();
    console.log("fetched");
  }, []);

  useEffect(() => {
    if (chats.length != 0) {
      return () => {
        mergeItem("chatlog", chats);
        console.log("merged");
      };
    }
  }, [chats]);*/

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.subContainer}>
        <CordLogo paddingBottom={0} size={50} weight={400} />
      </View>
      <ScrollView
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
      <View style={styles.textInputContainer}>
        <TextInput
          multiline
          style={styles.textInput}
          onChangeText={setInput}
          value={input}
          onSubmitEditing={async (e) => {
            if (input.trim().length > 0)
              await messageChatbot(input).then(() => setInput(""));
          }}
          placeholder="Enter your Message Here..."
        />
        <View style={{ justifyContent: "center" }}>
          <Text
            style={styles.text}
            onPress={() => {
              if (input == "CLEAR") {
                clear();
                setChats([]);
              } else if (input.trim().length > 0)
                messageChatbot(input).then(() => setInput(""));
            }}
          >
            ◯
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
