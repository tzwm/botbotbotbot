import { ChatGPTAPI } from "chatgpt";
import { DreamilyAPI } from "dreamily-api";
import { WechatBot } from "./messengers/wechat-bot.js";
import { Controller } from "./controller.js";
import { LarkMessenger } from "./messengers/lark.js";

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

new LarkMessenger(
  process.env.LARK_LISTENER_PATH || "/lark",
  Number(process.env.LARK_LISTENER_PORT) || 6347,
).start();

//new WechatBot(controller).start();
