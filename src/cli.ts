import { ChatGPTAPIBrowser } from "chatgpt";
import { Story } from "./story.js";
import { requestChatGPT } from "./utils.js";
import promptSync from "prompt-sync";

const prompt = promptSync({ sigint: true });

export class Cli {
  chatgpt: ChatGPTAPIBrowser;
  story: Story;

  constructor(chatgpt: ChatGPTAPIBrowser, story: Story) {
    this.chatgpt = chatgpt;
    this.story = story;
  }

  async run() {
    while (true) {
      console.log("is authenticated?", await this.chatgpt.getIsAuthenticated());

      const input = prompt(">");
      const roleId = "tzwm";

      const [cmd, body] = input.split(" ", 2);
      //console.log(cmd, ">", body);
      if (cmd == "start") {
        const nameAndBackground = prompt("join role>");
        await this.story.start(body, roleId, nameAndBackground);
      }
      if (cmd == "joinRole") {
        await this.story.joinRole(roleId, body);
      }
      if (cmd == "next") {
        await this.story.next(roleId, body);
      }
      if (cmd == "end") {
        await this.story.end(roleId);
      }

      if (cmd == "chat") {
        const res = await requestChatGPT(this.chatgpt, body);
        //console.log(res);
      }
    }
  }
}
