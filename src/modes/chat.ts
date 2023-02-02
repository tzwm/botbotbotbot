import { Env } from "../types.js";
import { Conversation } from "./conversation.js";
import { ChatGPTAPIBrowser } from "chatgpt";

export class Chat extends Conversation {
  constructor(chatgpt: ChatGPTAPIBrowser) {
    super(chatgpt);
  }

  async onMessage(_: string | null, content: string, env: Env): Promise<void> {
    const msg = await this.send(content, env);
    env.replyFunc(msg.response);
  }

  help(): string {
    return "Chat 模式：普通的同 ChatGPT 一样的对话模式，直接 at bot 说话就好。如果要开启新对话可以用 `/clear` 。";
  }

  configFilename(): string {
    return "chat";
  }
}
