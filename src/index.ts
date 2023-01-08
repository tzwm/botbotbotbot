import { ChatGPTAPIBrowser } from "chatgpt";
import { Story } from "./story.js";
import promptSync from 'prompt-sync';

async function initChatGPT(): Promise<ChatGPTAPIBrowser> {
  const chatgpt = new ChatGPTAPIBrowser({
    email: process.env.OPENAI_EMAIL || "",
    password: process.env.OPENAI_PASSWORD || "",
    proxyServer: process.env.HTTP_PROXY,
  });
  await chatgpt.initSession();

  return chatgpt;
}

const chatgpt = await initChatGPT();
const story = new Story(chatgpt);
const prompt = promptSync({ sigint: true });

while (true) {
  console.log("is authenticated?", await chatgpt.getIsAuthenticated());

  const input = prompt(">");
  const roleId = "tzwm";

  const [cmd, body] = input.split(" ", 2);
  //console.log(cmd, ">", body);
  if (cmd == "start") {
    const nameAndBackground = prompt("join role>");
    await story.start(body, roleId, nameAndBackground);
  }
  if (cmd == "joinRole") {
    await story.joinRole(roleId, body);
  }
  if (cmd == "next") {
    await story.next(roleId, body);
  }
  if (cmd == "end") {
    await story.end(roleId);
  }
}
