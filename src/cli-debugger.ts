import { ChatGPTAPI } from "chatgpt";
import { DreamilyAPI } from "dreamily-api";
import { Cli } from "./messengers/cli.js";
import { Controller } from "./controller.js";

console.log(process.env.OPENAI_API_KEY);

const chatgpt = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY || "",
  apiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  completionParams: {
    temperature: 1.4,
  },
  debug: true,
});
const dreamily = new DreamilyAPI(process.env.DREAMILY_TOKEN || "");

const controller = new Controller({
  chatgpt: chatgpt,
  dreamily: dreamily,
});

await new Cli(controller).onMessage();
