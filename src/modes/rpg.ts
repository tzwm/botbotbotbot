import { removeCmdPrefix } from "../utils.js";
import { Conversation } from "./conversation.js";
import {
  Env,
  Message,
} from "../types.js";
import fs from "fs";
import YAML from "yaml";

interface Role {
  id: string;
  name: string;
  background: string;
};

type CmdType = "start" | "next" | "end" | "join" | "goal";

const TEMPLATE = "rpg_20230112";

export class RPG extends Conversation {
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
    if (text.startsWith("/goal")) {
      return await this.goal(env);
    }

    return await this.next(text, env);
  }

  help(): string {
    return `> RPG 模式：一起玩游戏吧。目前故事设定以搞笑为主。
version: ${TEMPLATE}
/start #{background_of_the_world}
    故事设定、背景资料等。
    例子：/start 南边小岛上生活着一群兔头熊身的魔法师，他们热衷于编写整个大陆的百科全书。
/join #{background_of_the_role}
    自己作为一个角色加入故事中，附带上角色介绍和出场。
    例子：/join 我是没有头发、爱吃奥利奥的产品经理魔法师。正走在大街上觅食想要找一碗面吃。
/goal
    给每个加入的角色设定一个目标。
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
    this.addNewRole(env.senderId, env.senderName, background, env);
    const prompt = this.getPrompt("join", background, env.senderId);
    const res = await this.send(prompt, env);

    return res;
  }

  private async next(text: string, env: Env): Promise<Message> {
    const roll = Math.random();
    let prefix: string;
    if (roll == 0) { // fail
      env.replyFunc("Roll 点成功，继续……");
      prefix = this.template["next"]["prefix_success"];
    } else {
      env.replyFunc("Roll 点失败，嘿嘿……");
      prefix = this.template["next"]["prefix_fail"];
    }

    let prompt = this.getPrompt("next", prefix + text, env.senderId);
    return await this.send(prompt, env);
  }

  private async end(env: Env): Promise<Message> {
    const prompt = this.getPrompt("end", "", env.senderId);

    return await this.send(prompt, env);
  }

  private async goal(env: Env): Promise<Message> {
    const allNames = Array.from(this.roles.values()).map(
      (r: Role) => { r["name"]; }
    ).join("，");
    const prompt = this.getPrompt("goal", allNames, env.senderId);

    return await this.send(prompt, env);
  }

  private getPrompt(cmd: CmdType, text: string, roleId: string): string {
    const prefix = this.template[cmd]["prefix"] || "";
    const suffix = this.template[cmd]["suffix"] || "";
    let prompt: string;

    const role = this.roles.get(roleId);
    if (role && (cmd == "join" || cmd == "next")) {
      prompt = text.replace(/我/, role.name + " ");
    } else {
      prompt = text;
    }

    return [prefix, prompt, suffix].join("\n");
  }

  private addNewRole(roleId: string, name: string, background: string, env: Env): Role {
    let role = this.roles.get(roleId);
    if (role) {
      env.replyFunc(`你已经加入过了，你是 ${role.name}：${role.background}`);
      return role;
    }
    role = {
      id: roleId,
      name,
      background,
    }
    this.roles.set(roleId, role);

    return role;
  }

  private templateFile = fs.readFileSync(`data/templates/${TEMPLATE}.yaml`, "utf-8");
  private template = YAML.parse(this.templateFile)["actions"];
}