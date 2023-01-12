import {
  Message as WechatyMessage,
  Room,
  Contact
} from "wechaty";

export interface Env {
  senderId: string;
  senderName: string;
  //replyFunc: (text: string) => void;
}

export interface Message {
  id: string;
  prompt: string;
  response: string;
  senderId: string;
  conversationId: string;
  parentMessageId?: string;
};

export type ConversationType = "Chat" | "Story";

// for wechat
export type RoomOrPrivateType = "room" | "private";


// wechat: RoomOrPrivateType_id
// cli: fixed string
export type SessionIdType = `${RoomOrPrivateType}_${string}` | string; // this type is just string

export class ConversationError extends Error {};

//export type SessionType = "Cli" | "Wechaty";
