import { ChatMessage, ChatGPTAPI } from "chatgpt";

const MAX_TRY_COUNT = 2;

export async function requestChatGPT(
  chatgpt: ChatGPTAPI,
  prompt: string,
  conversationId?: string,
  parentMessageId?: string,
): Promise<ChatMessage> {
  let tryCount = 0;

  do {
    tryCount += 1;

    try {
      console.log("chatgpt.sendMessage",
                  `retried: ${tryCount - 1}`,
                  prompt,
                  { conversationId, parentMessageId });

      const res = await chatgpt.sendMessage(prompt, {
        conversationId,
        parentMessageId,
        timeoutMs: 2 * 60 * 1000,
      });

      console.log("chatgpt.response", res);

      if (res.text) {
        return res;
      }
    } catch (err: any) {
      console.error("chatgpt.error", prompt, err);

      //if (err.match(/error 429/)) { // too many requests
        //tryCount = MAX_TRY_COUNT + 1;
      //}

      if (tryCount > MAX_TRY_COUNT) {
        throw err;
      }
    }
  } while(tryCount <= MAX_TRY_COUNT);

  console.error("chatgpt.error", prompt, "no response");
  throw new Error("chatgpt.error no response");
}

export function removeCmdPrefix(text: string): string {
  return text.trim().replace(/^\/\w+\s+/, "");
}

export function replyNotFoundCmd(replyFunc: Function, message: string): void {
  console.warn("not found command", message);
  replyFunc("未找到命令");
}
