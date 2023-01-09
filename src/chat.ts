import {
  Conversation,
  Env,
  Message,
} from "./types.js";

export class Chat extends Conversation {
  async onMessage(text: string, env: Env): Promise<Message> {
    return await this.send(text, env);
  }
}
