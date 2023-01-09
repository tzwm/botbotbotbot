import { ChatGPTAPIBrowser } from "chatgpt";
//import { Cli } from "./cli.js";
import { WechatBot } from "./wechat-bot.js";

async function initChatGPT(): Promise<ChatGPTAPIBrowser> {
  const chatgpt = new ChatGPTAPIBrowser({
    email: process.env.OPENAI_EMAIL || "",
    password: process.env.OPENAI_PASSWORD || "",
    proxyServer: process.env.HTTP_PROXY,
  });
  chatgpt.initSession();

  return chatgpt;
}

const chatgpt = await initChatGPT();

//await new Cli(chatgpt, story).run();

new WechatBot(chatgpt).start();
