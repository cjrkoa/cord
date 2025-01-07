import { Message } from "./types";

export const uploadConversation = async (chats: Message[]) => {
  try {
    const response = await fetch("http://127.0.0.1:5000/upload_conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chats,
      }),
    });
    if (response.ok) console.log("success!");
  } catch (error) {
    console.log(error);
  }
};

export const filterOnlyUserInputs = async (chats: Message[]) => {
  let output: Message[] = [];

  for (let i = 0; i < chats.length; i++) {
    if (chats[i].type === "user") output.push(chats[i]);
  }

  return chats;
};
