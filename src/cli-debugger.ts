import { ChatGPTAPI } from "chatgpt";
import { DreamilyAPI } from "dreamily-api";
import { Cli } from "./messengers/cli.js";
import { Controller } from "./controller.js";


const chatgpt = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY || "",
  debug: true,
});
const dreamily = new DreamilyAPI(process.env.DREAMILY_TOKEN || "");

const controller = new Controller({
  chatgpt: chatgpt,
  dreamily: dreamily,
});

await new Cli(controller).onMessage();
