import { ChatGPTAPI } from "chatgpt";
import { DreamilyAPI } from "dreamily-api";
import { WechatBot } from "./messengers/wechat-bot.js";
import { WxworkBot } from "./messengers/wxwork-bot.js";

import { Controller } from "./controller.js";
import { LarkMessenger } from "./messengers/lark.js";

const chatgpt = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY || "",
  apiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  completionParams: {
    temperature: +(process.env.OPENAI_CHAT_TEMPERATURE || 0.8),
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
  controller,
).start();

//new WechatBot(controller).start();

//new WxworkBot(controller).start();
