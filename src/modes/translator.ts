import {
  Env,
} from "../types.js";
import { Conversation } from "./conversation.js";
import { ChatGPTAPI } from "chatgpt";

const PREFIX = "作为翻译器，帮我翻译下面这段，如果是英文翻译成中文，中文则翻译成英文。";

export class Translator extends Conversation {
  constructor(chatgpt: ChatGPTAPI) {
    super(chatgpt);
  }

  async onMessage(_: string, content: string, env: Env): Promise<void> {
    const prompt = [PREFIX, content].join("\n");
    const msg = await this.send(prompt, env);
    env.replyFunc(msg.response);
  }

  help(): string {
    return "Translator 模式：中英文互相翻译";
  }

  configFilename(): string {
    return "translator";
  }
}
