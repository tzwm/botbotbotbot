import { ChatGPTAPIBrowser } from "chatgpt";
import { Story } from "./story.js";
import { Cli } from "./cli.js";

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

await new Cli(chatgpt, story).run();
