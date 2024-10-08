import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  Button,
  TextInput,
  ScrollView,
  useColorScheme,
} from "react-native";
import { MessageContainer } from "@/components/Containers";
import { SafeAreaView } from "react-native-safe-area-context";
import { Message, MessageSchema } from "@/utils/types";
import { Colors } from "@/constants/Colors";
import CordLogo from "@/components/CordLogo";
import { mergeItem, getItem, getChatlog, clear } from "@/utils/AsyncStorage";

export default function Index() {
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Message[]>([]);

  const uploadConversation = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:5000/upload_conversation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chats,
          }),
        }
      );
      if (response.ok) console.log("success!");
    } catch (error) {
      console.log(error);
    }
  };

  const dummyChatbot = async (input: string) => {
    try {
      setChats((chats: Message[]) => {
        const updatedChats = [
          ...chats,
          { id: chats.length, type: "user", text: input },
        ];
        mergeItem("chatlog", updatedChats);
        return updatedChats;
      });
      await new Promise((resolve) => setTimeout(resolve, 1250));
      setChats((chats: Message[]) => {
        const updatedChats = [
          ...chats,
          {
            id: chats.length,
            type: "bot",
            text: "This is a test response so I don't have to call OpenAI's API",
          },
        ];
        mergeItem("chatlog", updatedChats);
        return updatedChats;
      });
      console.log(await getChatlog());
      return {
        id: chats.length,
        type: "bot",
        text: "This is a test response so I don't have to call OpenAI's API",
      };
    } catch (error) {
      console.error(error);
    }
  };

  const messageChatbot = async (input: string) => {
    try {
      setChats((chats) => [
        ...chats,
        { id: chats.length, type: "user", text: input },
      ]);
      await new Promise((resolve) => setTimeout(resolve, 1250));
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          memory: chats,
        }),
      });
      const json = await response.json();
      console.log(json);
      setChats((chats) => [
        ...chats,
        {
          id: chats.length,
          type: "bot",
          text: json["message"],
        },
        /*...json.map((item: any, i: number) => ({
          id: chats.length + i,
          type: "bot",
          text: item.text,
        })),*/
      ]);
      mergeItem("chatlog", { 0: chats });
      console.log(getChatlog());
      return json["message"];
      //return json.map((item: any) => item.text);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchChatlog = async () => {
    setChats(await getChatlog());
  };

  useEffect(() => {
    fetchChatlog();
    // Scroll to bottom whenever chats update
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chats]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors[colorScheme ?? "dark"].background,
      }}
    >
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? "dark"].tabBarBackground,
          height: "10%",
          alignItems: "center",
        }}
      >
        <CordLogo paddingBottom={0} size={50} weight={400} />
      </View>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {chats.map((data: Message, i: number) => (
          <MessageContainer
            key={i}
            text={data.text}
            textColor={
              data.type === "bot" ? Colors["dark"].text : Colors["light"].text
            }
            backgroundColor={data.type === "bot" ? "#a97afa" : "white"}
            alignItems={data.type === "bot" ? "flex-start" : "flex-end"}
          />
        ))}
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: Colors[colorScheme ?? "dark"].textInput,
          borderColor: Colors[colorScheme ?? "dark"].tint,
          borderWidth: 1,
          borderRadius: 50,
          padding: 5,
          margin: 10,
        }}
      >
        <TextInput
          style={{
            padding: 15,
            width: "90%",
            color: Colors[colorScheme ?? "dark"].text,
          }}
          onChangeText={setInput}
          value={input}
          onSubmitEditing={(e) => {
            if (input.length > 0)
              messageChatbot(input).then(() => setInput(""));
          }}
          placeholder="Enter your Message Here..."
        />
        <Text
          style={{ color: "blue", fontSize: 25, paddingTop: 8 }}
          onPress={() => {
            if (input === "UPLOAD") uploadConversation();
            else if (input == "CLEAR") clear();
            else if (input.length > 0)
              messageChatbot(input).then(() => setInput(""));
          }}
        >
          ◯
        </Text>
      </View>
    </SafeAreaView>
  );
}
