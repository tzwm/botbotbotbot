import { ChatGPTAPI } from "chatgpt";
import { DreamilyAPI } from "dreamily-api";
import { WechatBot } from "./messengers/wechat-bot.js";
import { Controller } from "./controller.js";


const chatgpt = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY || "",
  completionParams: {
    temperature: 1.4,
  },
});
const dreamily = new DreamilyAPI(process.env.DREAMILY_TOKEN || "");

const controller = new Controller({
  chatgpt: chatgpt,
  dreamily: dreamily,
});

new WechatBot(controller).start();
