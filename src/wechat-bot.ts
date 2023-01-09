import { ChatGPTAPIBrowser } from "chatgpt";
import qrcodeTerminal from "qrcode-terminal";
import {
  Wechaty,
  log,
  WechatyBuilder,
  Message,
  Contact,
  types as wechatyTypes,
  ScanStatus,
} from "wechaty";
//import { Story } from "./story.js";
import { Chat } from "./chat.js";
import * as types from "./types.js";


//TODO: don't hard code this name
const masterUsername = "tzwm";

type RoomOrPrivateType = "room" | "private";
type ConversationKeyType = `${RoomOrPrivateType}_${string}`;

export class WechatBot {
  bot: Wechaty;
  chatgpt: ChatGPTAPIBrowser;

  conversions: Map<ConversationKeyType, types.Conversation>;
  //conversationsRoom: Map<string, Conversation>; // contactId => Conversation

  constructor(chatgpt: ChatGPTAPIBrowser) {
    this.chatgpt = chatgpt;
    this.conversions = new Map();

    this.bot = WechatyBuilder.build({
      name: "mtrpg-wechat-bot",
    });

    this.bot.on("scan", this.onScan);
    this.bot.on("login", this.onLogin);
    this.bot.on("logout", this.onLogout);
    this.bot.on("message", this.onMessage.bind(this));
  }

  start() {
    this.bot.start()
    .then(() => log.info("StarterBot", "Starter Bot Started."))
    .catch(e => log.error("StarterBot", e));
  }

  async sendToMaster(text: string) {
    const user = await this.bot.Contact.find({ name: masterUsername });
    if (user) {
      user.say(text);
    }
  }

  private async onMessage(msg: Message) {
    if (msg.age() > 2 * 60) {
      return;
    }
    if (msg.type() != wechatyTypes.Message.Text) {
      return;
    }

    const room = msg.room();
    let text = msg.text().trim();
    if (room) {
      if (!await msg.mentionSelf()) {
        return;
      }

      text = text.replace(/^@\w+ {1}/, "").trim(); // remove @bot from text
    }

    console.log("wechaty message received:", msg);

    const talker = msg.talker();
    const roomOrPrivate: RoomOrPrivateType = room ? "room" : "private";
    const spaceId = room ? room.id : talker.id;
    const conversationKey: ConversationKeyType = `${roomOrPrivate}_${spaceId}`;

    if (text.startsWith("/clear")) {
      this.conversions.delete(conversationKey);
      msg.say("对话清除了，可以 /start 重新开始");
      return;
    }

    if (text.startsWith("/start")) {
      const convType = text.replace(/^\/start\s*/, "").trim().toLowerCase();
      if (convType == "chat") {
        this.conversions.set(conversationKey, new Chat());
        msg.say("开始 Chat 模式，日常对话");
        return;
      }
      if (convType == "story") {
        //this.conversions.set(conversationKey, new Story());
        msg.say("开始 Story 模式，一起续写故事吧");
        return;
      }

      msg.say(`没找到 ${convType} 这个模式`);
      return;
    }

    if (text.startsWith("/help")) {
      msg.say(
`/help - 帮助
/clear - 清除对话
/start #{mode} - mode: chat | story`
      );
      return;
    }

    const env: types.Env = {
      chatgpt: this.chatgpt,
      senderId: talker.id,
    };

    let conversation = this.conversions.get(conversationKey);
    if (!conversation) {
      conversation = new Chat();
      this.conversions.set(conversationKey, conversation);
    }
    const res = await conversation.onMessage(text, env);
    msg.say(res.response);
    return;
  }

  private onScan(qrcode: string, status: ScanStatus) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
      qrcodeTerminal.generate(qrcode, { small: true });  // show qrcode on console

      const qrcodeImageUrl = [
        "https://wechaty.js.org/qrcode/",
        encodeURIComponent(qrcode),
      ].join("");

      log.info("StarterBot", "onScan: %s(%s) - %s", ScanStatus[status], status, qrcodeImageUrl);

    } else {
      log.info("StarterBot", "onScan: %s(%s)", ScanStatus[status], status);
    }
  }

  private onLogin(user: Contact) {
    log.info("StarterBot", "%s login", user);
  }

  private onLogout(user:Contact) {
    log.info("StarterBot", "%s logout", user);
  }
}
