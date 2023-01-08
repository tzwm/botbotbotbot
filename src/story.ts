import { ChatGPTAPIBrowser, ChatResponse } from "chatgpt";
import { requetChatGPT } from "./utils.js";

interface Role {
  id: string;
  name: string;
  background: string;
};

interface Message {
  id: string;
  prompt: string;
  body: string;
  roleId: string;
  conversationId: string;
  parentMessageId?: string;
};

type PREFIX_TYPE = "start" | "next" | "end" | "roleJoin";

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
  end: "给每个人物写一个充满神奇而惊喜的结局。",
  roleJoin: "加入新的角色：",
};

export class Story {
  chatgpt: ChatGPTAPIBrowser;
  conversationId!: string;
  lastMessageId!: string;
  roles!: Map<string, Role>; //roleId => Role
  messages!: Array<Message>;

  constructor(chatgpt: ChatGPTAPIBrowser) {
    this.chatgpt = chatgpt;
  };

  async start(opening: string, roleId: string, nameAndBackground: string): Promise<Message> {
    const { name, background } = this.splitJoinPrompt(nameAndBackground);
    const prompt = this.getPrompt("start", opening, roleId);
    const res = await requetChatGPT(this.chatgpt, prompt);

    this.addNewRole(roleId, name, background);
    return this.addNewMessage(roleId, prompt, res);
  }

  async joinRole(roleId: string, nameAndBackground: string): Promise<Message> {
    const { name, background } = this.splitJoinPrompt(nameAndBackground);
    const prompt = this.getPrompt("roleJoin", nameAndBackground, roleId);
    const res = await requetChatGPT(
      this.chatgpt,
      prompt,
      this.conversationId,
      this.lastMessageId
    );

    this.addNewRole(roleId, name, background);
    return this.addNewMessage(roleId, prompt, res);
  }

  async next(roleId: string, text: string): Promise<Message> {
    const prompt = this.getPrompt("next", text, roleId);
    const res = await requetChatGPT(
      this.chatgpt,
      prompt,
      this.conversationId,
      this.lastMessageId
    );

    return this.addNewMessage(roleId, prompt, res);
  }

  async end(roleId: string): Promise<Message> {
    const prompt = this.getPrompt("next", "", roleId);
    const res = await requetChatGPT(
      this.chatgpt,
      prompt,
      this.conversationId,
      this.lastMessageId
    );

    return this.addNewMessage(roleId, prompt, res);
  }

  private splitJoinPrompt(prompt: string): { name: string, background: string } {
    const rets = prompt.split(/,|，/, 1);
    if (rets.length !== 2 || rets[0].length > 10) {
      console.error("story.error.splitJoinPrompt", prompt);
      throw new StoryError("wrong text for joinRole");
    }

    return {name: rets[0], background: rets[1]};
  }

  private getPrompt(prefix: PREFIX_TYPE, text: string, roleId: string, opts?: any): string {
    const role = this.roles.get(roleId);
    if (role == undefined) {
      throw new StoryError("missing Role for getPrompt");
    }

    let prompt = PROMPTS_PREFIX[prefix];

    if (prefix == "start") {
      prompt += text +
        "\n" +
        PROMPTS_PREFIX["roleJoin"] +
        opts.nameAndBackground.replace(/我/, role.name);
    }
    if (prefix == "roleJoin") {
      prompt += text.replace(/我/, role.name);
    }
    if (prefix == "next") {
      prompt += text.replace(/我/, role.name);
    }

    return prompt;
  }

  private addNewMessage(roleId: string, prompt: string, res: ChatResponse): Message {
    this.conversationId = res.conversationId;
    this.lastMessageId = res.messageId;
    const msg = {
      id: res.messageId,
      prompt: prompt,
      body: res.response,
      roleId: roleId,
      conversationId: res.conversationId,
    };
    this.messages.push(msg);

    return msg
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
