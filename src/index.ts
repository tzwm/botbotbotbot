import { ChatGPTAPIBrowser } from "chatgpt";
import { Cli } from "./cli.js";
import { WechatBot } from "./wechat-bot.js";
import { Controller } from "./controller.js";

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

const controller = new Controller({
  chatgpt: chatgpt,
});

new WechatBot(controller).start();
//await new Cli(controller).start();
