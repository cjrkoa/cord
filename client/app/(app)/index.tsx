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
import { Message, MessageSchema } from "@/types";
import { Colors } from "@/constants/Colors";
import CordLogo from "@/components/CordLogo";

export default function Index() {
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Message[]>([
    { id: 0, type: "bot", text: "Hello! :)" },
    {
      id: 1,
      type: "bot",
      text: "I'm Cord, your emotional support chatbot.",
    },
    {
      id: 2,
      type: "bot",
      text: "How are you feeling today?",
    },
  ]);

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
      return json["message"];
      //return json.map((item: any) => item.text);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
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
