type Message = {
  id: number;
  type: string;
  text: string;
};

const MessageSchema = {
  name: "Message",
  properties: {
    id: "int",
    type: "string",
    text: "string",
  },
};

export { Message, MessageSchema };
