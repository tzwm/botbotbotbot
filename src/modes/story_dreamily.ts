import { Conversation } from "./conversation.js";
import { DreamilyAPI } from "dreamily-api";
import { Env } from "../types.js";
import { replyNotFoundCmd } from "../utils.js";

export class StoryDreamily extends Conversation {
  universeId: string;

  constructor(dreamily: DreamilyAPI) {
    super(dreamily);

    this.universeId = "";
  }

  async onMessage(cmd: string, content: string, env: Env): Promise<void> {
    const replyFunc = env.replyFunc;

    switch(cmd) {
      case "open":
        this.universeId = content;
        replyFunc(`世界设定为：${this.universeId}`);
        return;
      case "previous":
        replyFunc(`前情提要：${this.fullStory()}`);
        return;
      case "next":
        const msg = await this.send(
          [this.fullStory(), content].join(""),
          env
        );
        replyFunc(msg.response);
        return;
      default:
        replyNotFoundCmd(replyFunc, env.message);
    }
  }

  help(): string {
    return `> 小梦 Story 模式：大家一起和小梦写故事。
/start #{universe_id} 世界设定的 ID
/previous 前情提要`;
  }

  configFilename(): string {
    return "story_dreamily";
  }

  private fullStory(): string {
    if (this.messages.length == 0) {
      return "";
    }

    const lastMsg = this.messages[this.messages.length - 1];
    return [lastMsg.prompt, lastMsg.response].join("");
  }
}
