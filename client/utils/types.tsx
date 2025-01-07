type Message = {
  id: number;
  type: string;
  text: string;
};

type CloseModalProps = {
  closeModal: () => void;
};

const MessageSchema = {
  name: "Message",
  properties: {
    id: "int",
    type: "string",
    text: "string",
  },
};

type AuthResponse = {
  access_token: string;
  refresh_token: string;
};

export { Message, MessageSchema, CloseModalProps, AuthResponse };
