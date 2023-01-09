import {
  Conversation,
  Env,
  Message,
} from "./types.js";

export class Chat extends Conversation {
  async onMessage(text: string, env: Env): Promise<Message> {
    return await this.send(text, env);
  }

  help(): string {
    return "Chat 模式：普通的同 ChatGPT 一样的对话模式，直接 at bot 说话就好。如果要开启新对话可以用 `/clear` 。";
  }
}
