import { ChatGPTAPIBrowser } from "chatgpt";
import {
  Env,
  Message,
} from "./types.js";
import { requestChatGPT } from "./utils.js";

export abstract class Conversation {
  service: ChatGPTAPIBrowser;
  conversationId?: string;
  lastMessageId?: string;
  messages = new Array<Message>();

  abstract onMessage(text: string, env: Env): Promise<Message>;
  abstract help(): string;

  constructor(service: ChatGPTAPIBrowser) {
    this.service = service;
  }

  protected async send(prompt: string, env: Env): Promise<Message> {
    env.replyFunc("收到，请耐心等待，我是有点慢……看到回复前给我发消息基本是无效的。");

    prompt = prompt.trim();
    let msg: Message;
    let conversationId: string;
    let messageId: string;

    if (this.service instanceof ChatGPTAPIBrowser) {
      const res = await requestChatGPT(
        this.service,
        prompt,
        this.conversationId,
        this.lastMessageId
      );

      msg = {
        id: res.messageId,
        prompt: prompt,
        response: res.response,
        senderId: env.senderId,
        conversationId: res.conversationId,
        parentMessageId: this.lastMessageId,
      };
      conversationId = res.conversationId;
      messageId = res.messageId;
    } else {
      throw new Error("not found this service type");
    }

    this.messages.push(msg);
    this.conversationId = conversationId;
    this.lastMessageId = messageId;

    return msg;
  }
}
