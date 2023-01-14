import { ChatGPTAPIBrowser } from "chatgpt";
import { DreamilyAPI } from "dreamily-api";
import {
  Env,
  Message,
} from "../types.js";
import { requestChatGPT } from "../utils.js";

type ServiceType = ChatGPTAPIBrowser | DreamilyAPI;

export abstract class Conversation {
  service: ServiceType;
  conversationId?: string;
  lastMessageId?: string;
  universeId?: string;
  messages = new Array<Message>();

  abstract onMessage(text: string, env: Env): Promise<void>;
  abstract help(): string;

  constructor(service: ServiceType) {
    this.service = service;
  }

  protected async send(prompt: string, env: Env): Promise<Message> {
    env.replyFunc("收到，请耐心等待，我是有点慢……看到回复前给我发消息基本是无效的。");

    prompt = prompt.trim();
    let msg: Message;

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
      this.conversationId = res.conversationId;
      this.lastMessageId = res.messageId;
    } else {
      if (this.service instanceof DreamilyAPI) {
        const res = await this.service.continue(
          prompt,
          this.universeId || "",
        );

        msg = {
          id: "", //FIXME: maybe use UUID?
          prompt: prompt,
          response: res,
          senderId: env.senderId,
          conversationId: "", //FIXME: maybe use UUID?
          universeId: this.universeId,
        }
      } else {
        throw new Error("not found this service type");
      }
    }

    this.messages.push(msg);

    return msg;
  }
}
