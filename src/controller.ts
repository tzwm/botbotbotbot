import { Env } from "./types.js";
import * as types from "./types.js";
import { Conversation } from "./modes/conversation.js";
import { ChatGPTAPI } from "chatgpt";
import { removeCmdPrefix, replyNotFoundCmd } from "./utils.js";
import { Story } from "./modes/story.js";
import { Chat } from "./modes/chat.js";
import { RPG } from "./modes/rpg.js";
import { StoryDreamily } from "./modes/story_dreamily.js";
import { Translator } from "./modes/translator.js";
import { DreamilyAPI } from "dreamily-api";

interface Services {
  chatgpt?: ChatGPTAPI;
  dreamily?: DreamilyAPI;
};

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
    env: Env
  ): Promise<void> {
    message = message.trim();
    const replyFunc = env.replyFunc;
    let conversation = this.sessions.get(sessionId);

    const cmd = this.getCommand(message, conversation);
    if (cmd === null) {
      return replyNotFoundCmd(replyFunc, message);
    }

    const content = removeCmdPrefix(message);
    // == global commands ==
    switch(cmd) {
      case "help":
        this.printHelp(conversation, env);
        return;
      case "clear":
        this.sessions.delete(sessionId);
        replyFunc("对话清除了，可以 /start 重新开始");
        return;
      case "start":
        this.processStartCmd(
          message,
          conversation,
          sessionId,
          env,
        );
        return;
    }

    // == mode commands ==
    if (conversation) {
      await conversation.onMessage(
        cmd,
        content,
        env
      );
    } else {
      replyNotFoundCmd(replyFunc, message);
    }
  }

  private printHelp(conversation: Conversation | undefined, env: Env) {
    let res = `==== 全局命令 ====
/help - 帮助
/clear - 清除对话
/start #{mode} - mode: chat | story | rpg | translator | dstory \n`;
    if (conversation) {
      res += `==== 当前模式 ${conversation.constructor.name}：已进行 ${conversation.messages.length} 轮对话 ====\n` +
        `${conversation.help()}`;
    }

    env.replyFunc(res);
  }

  private getCommand(message: string, conversation: Conversation | undefined): string | null {
    let cmd = message.match(/^\/\w+/)?.[0];
    if (!cmd) {
      if (!conversation) {
        return null;
      }

      cmd = conversation.config.default_command;
      return cmd || null;
    }

    return cmd.substring(1);
  }

  private async processStartCmd(
    message: string,
    conversation: Conversation | undefined,
    sessionId: types.SessionIdType,
    env: Env,
  ): Promise<void> {
    const cmd = "start";
    const replyFunc = env.replyFunc;

    // conversation's commands
/*    if (conversation) {*/
      /*return await conversation.onMessage(*/
        /*cmd,*/
        /*message,*/
        /*env*/
      /*);*/
    /*}*/

    // start new game by mode
    const mode = removeCmdPrefix(message).toLowerCase();
    let session: Conversation | undefined;
    //TODO: Improve it
    if (this.services["chatgpt"]) {
      switch(mode) {
        case "chat":
          session = new Chat(this.services["chatgpt"]);
          break;
        case "story":
          session = new Story(this.services["chatgpt"]);
          break;
        case "rpg":
          session = new RPG(this.services["chatgpt"]);
          break;
        case "tran":
        case "translator":
          session = new Translator(this.services["chatgpt"]);
          break;
      }
    }
    if (this.services["dreamily"]) {
      switch(mode) {
        case "dstory":
          session = new StoryDreamily(this.services["dreamily"]);
          break;
      }
    }

    if (session) {
      this.sessions.set(sessionId, session);
      replyFunc(`开启 ${session.config.name} 模式。`);
    } else {
      replyFunc(`没找到 ${mode} 这个模式`);
    }
  }
}
