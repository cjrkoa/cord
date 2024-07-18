import React, { useState, useEffect, useRef } from "react";
import { Text, View, Button, TextInput, ScrollView } from "react-native";
import { MessageContainer } from "@/components/Containers";
import { SafeAreaView } from "react-native-safe-area-context";
import { Message } from "@/types";

export default function Index() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Message[]>([
    { id: 0, type: "response", text: "Hello!" },
    {
      id: 1,
      type: "response",
      text: "I'm Cord, your emotional support chatbot.",
    },
    {
      id: 2,
      type: "response",
      text: "Type out a message and let's get chatting! :)",
    },
  ]);

  const messageChatbot = async (input: string) => {
    try {
      setChats((chats) => [
        ...chats,
        { id: chats.length, type: "input", text: input },
      ]);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const response = await fetch(
        "http://0.0.0.0:5005/webhooks/rest/webhook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
          }),
        }
      );
      const json = await response.json();
      console.log(json);
      setChats((chats) => [
        ...chats,
        ...json.map((item: any, i: number) => ({
          id: chats.length + i,
          type: "response",
          text: item.text,
        })),
      ]);
      return json.map((item: any) => item.text);
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
        backgroundColor: "#100c17",
      }}
    >
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
            backgroundColor={data.type === "response" ? "#a97afa" : "white"}
            alignItems={data.type === "response" ? "flex-start" : "flex-end"}
          />
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row" }}>
        <TextInput
          style={{ padding: 15, width: "90%", color: "white" }}
          onChangeText={setInput}
          value={input}
          onSubmitEditing={(e) => {
            if (input.length > 0)
              messageChatbot(input).then(() => setInput(""));
          }}
          placeholder="Enter your Message Here..."
        />
        <Button
          title="◯"
          onPress={() => {
            if (input.length > 0)
              messageChatbot(input).then(() => setInput(""));
          }}
        />
      </View>
    </SafeAreaView>
  );
}
