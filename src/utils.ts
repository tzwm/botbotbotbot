import { ChatResponse, ChatGPTAPIBrowser } from "chatgpt";

const MAX_TRY_COUNT = 2;

export async function requetChatGPT(
  chatgpt: ChatGPTAPIBrowser,
  prompt: string,
  conversationId?: string,
  parentMessageId?: string,
): Promise<ChatResponse> {
  let tryCount = 0;

  do {
    tryCount += 1;

    try {
      console.log("chatgpt.sendMessage", prompt, {
        conversationId,
        parentMessageId,
      });

      const res = await chatgpt.sendMessage(prompt, {
        conversationId,
        parentMessageId,
      });

      console.log("chatgpt.response", res);

      if (res.response) {
        return res;
      }
    } catch (err: any) {
      console.error("chatgpt.error", prompt, err);

      if (tryCount > MAX_TRY_COUNT) {
        throw err;
      }
    }
  } while(tryCount <= MAX_TRY_COUNT);

  console.error("chatgpt.error", prompt, "no response");
  throw new Error("chatgpt.error no response");
}
