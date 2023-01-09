import { ChatGPTAPIBrowser } from "chatgpt";
import { requestChatGPT } from "./utils.js";

export interface Env {
  chatgpt: ChatGPTAPIBrowser;
  senderId: string;
  senderName: string;
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

export class ConversationError extends Error {};

export abstract class Conversation {
  conversationId?: string;
  lastMessageId?: string;
  messages = new Array<Message>();

  abstract onMessage(text: string, env: Env): Promise<Message>;
  abstract help(): string;

  protected async send(prompt: string, env: Env): Promise<Message> {
    prompt = prompt.trim();
    const res = await requestChatGPT(
      env.chatgpt,
      prompt,
      this.conversationId,
      this.lastMessageId
    );

    const msg = {
      id: res.messageId,
      prompt: prompt,
      response: res.response,
      senderId: env.senderId,
      conversationId: res.conversationId,
      parentMessageId: this.lastMessageId,
    };
    this.messages.push(msg);
    this.conversationId = res.conversationId;
    this.lastMessageId = res.messageId;

    return msg;
  }
}
