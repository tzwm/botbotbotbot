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
import { FileBox } from 'file-box';
import * as types from "../types.js";
import { Controller } from "../controller.js";


export class WechatBot {
  bot: Wechaty;
  controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;

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

  private async onMessage(msg: Message) {
    if (msg.age() > 30) { // 30 seconds
      return;
    }
    if (msg.type() != wechatyTypes.Message.Text) {
      return;
    }
    if (msg.self()) {
      return;
    }

    const room = msg.room();
    let text = msg.text().trim();

    if (text == "test") {
      const img = FileBox.fromUrl("https://replicate.delivery/pbxt/f4nlztv3uz1iFC4AEf2wBYQGTezdVeysvtZUtwfsvZOJDN6AC/out-0.png");
      msg.say(img);
    }

    if (room) {
      if (!await msg.mentionSelf()) {
        return;
      }

      text = text.replace(/^@\S+\s+/, "").trim(); // remove @bot from text
    }

    console.log("wechaty message received:", msg);

    const talker = msg.talker();
    const roomOrPrivate: types.RoomOrPrivateType = room ? "room" : "private";
    const id = room ? room.id : talker.id;
    const sessionId: types.SessionIdType = `${roomOrPrivate}_${id}`;

    let senderName = talker.name().trim();
    if (room) {
      const roomAlias = await room.alias(talker);
      if (roomAlias) {
        senderName = roomAlias;
      }
    }
    if (!senderName) {
      senderName = "无名氏" + talker.id.slice(-4);
    }

    const env: types.Env = {
      senderId: talker.id,
      senderName: senderName,
      replyFunc: msg.say.bind(msg),
      message: text,
    };

    await this.controller.onMessage(
      text,
      sessionId,
      env
    );
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
