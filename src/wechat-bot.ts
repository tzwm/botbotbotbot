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
import * as types from "./types.js";
import { Controller } from "./controller.js";


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

    const room = msg.room();
    let text = msg.text().trim();
    if (room) {
      if (!await msg.mentionSelf()) {
        return;
      }

      text = text.replace(/^@\w+\s+/, "").trim(); // remove @bot from text
    }

    console.log("wechaty message received:", msg);

    const talker = msg.talker();
    const roomOrPrivate: types.RoomOrPrivateType = room ? "room" : "private";
    const spaceId = room ? room.id : talker.id;
    const sessionId : types.SessionIdType = `${roomOrPrivate}_${spaceId}`;
    let senderName: string | undefined;
    if (room) {
      senderName = await room.alias(talker);
    }
    if (!senderName) {
      senderName = talker.name();
    }
    const env: types.Env = {
      senderId: talker.id,
      senderName: senderName,
    };

    await this.controller.onMessage(
      text,
      sessionId,
      msg.say.bind(msg),
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
