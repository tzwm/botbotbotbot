import { ChatGPTAPI } from "chatgpt";
import { DreamilyAPI } from "dreamily-api";
import {
  Env,
  Message,
} from "../types.js";
import { requestChatGPT } from "../utils.js";
import fs from "fs";
import YAML from "yaml";

type ServiceType = ChatGPTAPI | DreamilyAPI;


export abstract class Conversation {
  service: ServiceType;
  conversationId?: string;
  lastMessageId?: string;
  universeId?: string;
  messages = new Array<Message>();
  config: any;

  abstract onMessage(cmd: string, text: string, env: Env): Promise<void>;
  abstract help(): string;
  abstract configFilename(): string;

  constructor(service: ServiceType) {
    this.service = service;

    const configFile = fs.readFileSync(
      `${this.configDir}${this.configFilename()}/overview.yaml`,
      "utf-8",
    );
    this.config = YAML.parse(configFile);
  }

  protected async send(prompt: string, env: Env): Promise<Message> {
    prompt = prompt.trim();
    let msg: Message;

    if (this.service instanceof ChatGPTAPI) {
      env.replyFunc("收到，请耐心等待，我是有点慢……看到回复前给我发消息基本是无效的。");

      const res = await requestChatGPT(
        this.service,
        prompt,
        this.lastMessageId
      );

      msg = {
        id: res.id,
        prompt: prompt,
        response: res.text,
        senderId: env.senderId,
        conversationId: res.conversationId,
        parentMessageId: this.lastMessageId,
      };
      this.conversationId = res.conversationId;
      this.lastMessageId = res.id;
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

  protected configDir = "templates/";
}
