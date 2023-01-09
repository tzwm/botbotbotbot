import { ChatGPTAPIBrowser, ChatResponse } from "chatgpt";
import { requestChatGPT, removeCmdPrefix } from "./utils.js";
import {
  Conversation,
  Env,
  Message,
} from "./types.js";

interface Role {
  id: string;
  name: string;
  background: string;
};

type CmdType = "start" | "next" | "end" | "join";

class StoryError extends Error {};

const PROMPTS_PREFIX = {
  start: `现在来充当一个冒险文字游戏。我有一些要求需要你注意：
1. 续写故事的时候节奏不要太快，一次只需写二到四句话，描述大概五分钟内发生的事情
2. 要仔细描述各个人物的心情和周边环境，注意人物性格和特点
3. 故事要非常有戏剧性，以反转和搞笑为主
4. 不要出现任何新角色
开头是：
`,
  next: "继续，注意上下文联系。一次只写二到四句话，描述大概 5 分钟内发生的事情。尽量兼顾到大部分角色。要仔细描述各个人物的心情和周边环境，注意人物性格和特点。故事要非常有戏剧性，以反转和搞笑为主。",
  end: "概述整个故事，并给每个人物写一个充满神奇而惊喜的结局。",
  join: "加入新的角色：",
};

const PROMPTS_SUFFIX = {
  start: "先记住这个开头，不用继续续写故事。",
  next: "",
  end: "",
  join: "继续，注意上下文联系。一次只写二到四句话，描述大概 5 分钟内发生的事情。尽量兼顾到大部分角色。要仔细描述各个人物的心情和周边环境，注意人物性格和特点。故事要非常有戏剧性，以反转和搞笑为主。",
};

export class Story extends Conversation {
  roles = new Map<string, Role>(); //roleId => Role

  async onMessage(text: string, env: Env): Promise<Message> {
    if (text.startsWith("/start")) {
      return await this.start(removeCmdPrefix(text), env);
    }
    if (text.startsWith("/join")) {
      return await this.join(removeCmdPrefix(text), env);
    }

    const role = this.roles.get(env.senderId);
    if (!role) {
      return {
        id: "",
        prompt: text,
        response: "还没有加入，请先 /join 加入",
        senderId: env.senderId,
        conversationId: this.conversationId || "",
      };
    }

    if (text.startsWith("/next")) {
      return await this.next(removeCmdPrefix(text), env);
    }
    if (text.startsWith("/end")) {
      return await this.end(env);
    }

    return await this.next(text, env);
  }

  help(): string {
    return `> Story 模式：大家一起写故事。
/start #{background_of_the_world}
    故事设定、背景资料等。
    例子：/start 南边小岛上生活着一群兔头熊身的魔法师，他们热衷于编写整个大陆的百科全书。
/join #{background_of_the_role}
    自己作为一个角色加入故事中，附带上角色介绍和出场。
    例子：/join 我是没有头发、爱吃奥利奥的产品经理魔法师。正走在大街上觅食想要找一碗面吃。
/next #{content}
    继续写故事，最好以第一人称。
    例子：/next 我看到一个不错的拉面店走了进去，没想到这是一家魔法拉面道具店。
/end
    结束这个故事。`;
  }

  private async start(opening: string, env: Env): Promise<Message> {
    const prompt = this.getPrompt(
      "start",
      opening,
      env.senderId,
    );

    return await this.send(prompt, env);
  }

  private async join(background: string, env: Env): Promise<Message> {
    this.addNewRole(env.senderId, env.senderName, background);
    const prompt = this.getPrompt("join", background, env.senderId);
    const res = await this.send(prompt, env);

    return res;
  }

  private async joinWithName(nameAndBackground: string, env: Env): Promise<Message> {
    const { name, background } = this.splitJoinPrompt(nameAndBackground);
    const prompt = this.getPrompt("join", nameAndBackground, env.senderId);
    const res = await this.send(prompt, env);
    this.addNewRole(env.senderId, name, background);

    return res;
  }

  private async next(text: string, env: Env): Promise<Message> {
    const prompt = this.getPrompt("next", text, env.senderId);

    return await this.send(prompt, env);
  }

  private async end(env: Env): Promise<Message> {
    const prompt = this.getPrompt("end", "", env.senderId);

    return await this.send(prompt, env);
  }

  private splitJoinPrompt(prompt: string): { name: string, background: string } {
    const rets = prompt.split(/[,，\s]\s*/, 2);
    if (rets.length !== 2 || rets[0].length > 10) {
      console.error("story.error.splitJoinPrompt", prompt);
      throw new StoryError("wrong text for joinRole");
    }

    return {
      name: rets[0],
      background: rets[1]
    };
  }

  private getPrompt(cmd: CmdType, text: string, roleId: string): string {
    let prompt = PROMPTS_PREFIX[cmd];

    if (cmd == "start") {
      prompt += text + "\n" + PROMPTS_SUFFIX[cmd];

      return prompt;
    }

    const role = this.roles.get(roleId);
    if (cmd == "join" || cmd == "next") {
      if (role) {
        prompt += text.replace(/我/, role.name);
      } else {
        prompt += text;
      }
    }

    return prompt + "\n" + PROMPTS_SUFFIX[cmd];
  }

  private addNewRole(roleId: string, name: string, background: string): Role {
    const role = {
      id: roleId,
      name,
      background,
    }
    this.roles.set(roleId, role);

    return role;
  }
}
