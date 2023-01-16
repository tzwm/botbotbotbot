import { ChatGPTAPIBrowser } from "chatgpt";
import { DreamilyAPI } from "dreamily-api";
import { WechatBot } from "./messengers/wechat-bot.js";
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
const dreamily = new DreamilyAPI(process.env.DREAMILY_TOKEN || "");

const controller = new Controller({
  chatgpt: chatgpt,
  dreamily: dreamily,
});

new WechatBot(controller).start();
