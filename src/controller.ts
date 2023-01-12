import { Env } from "./types.js";
import * as types from "./types.js";
import { Conversation } from "./conversation.js";
import { ChatGPTAPIBrowser } from "chatgpt";
import { removeCmdPrefix } from "./utils.js";
import { Story } from "./story.js";
import { Chat } from "./chat.js";

interface Services {
  chatgpt?: ChatGPTAPIBrowser;
};

type ReplayFuncType = (text: string) => void;

export class Controller {
  sessions: Map<types.SessionIdType, Conversation>;
  services: Services;

  constructor(services: Services) {
    this.sessions = new Map();
    this.services = services;
  }

  async onMessage(
    message: string,
    sessionId: types.SessionIdType,
    replyFunc: ReplayFuncType,
    env: Env): Promise<void> {
    let conversation = this.sessions.get(sessionId);

    // == high priority commands ==
    if (message.startsWith("/help")) {
      return this.printHelp(conversation, replyFunc);
    }

    if (message.startsWith("/clear")) {
      this.sessions.delete(sessionId);
      return replyFunc("对话清除了，可以 /start 重新开始");
    }

    // conversation's commands
    if (conversation) {
      const res = await conversation.onMessage(message, env);
      return replyFunc(res.response);
    }

    if (message.startsWith("/start")) {
      const convType = removeCmdPrefix(message).toLowerCase();
      if (this.services["chatgpt"]) {
        if (convType == "chat") {
          this.sessions.set(sessionId, new Chat(this.services["chatgpt"]));
          return replyFunc("开始 Chat 模式，日常对话");
        }
        if (convType == "story") {
          this.sessions.set(sessionId, new Story(this.services["chatgpt"]));
          return replyFunc("开始 Story 模式，一起续写故事吧");
        }
      }
      return replyFunc(`没找到 ${convType} 这个模式`);
    }

    replyFunc("请先 /start ${mode} 开始");
  }

  private printHelp(conversation: Conversation | undefined, replyFunc: ReplayFuncType) {
    let res = `==== 全局命令 ====
/help - 帮助
/clear - 清除对话
/start #{mode} - mode: chat | story\n`;
    if (conversation) {
      res += `==== 当前模式 ${conversation.constructor.name}：已进行 ${conversation.messages.length} 轮对话 ====\n` +
        `${conversation.help()}`;
    }

    replyFunc(res);
  }
}
