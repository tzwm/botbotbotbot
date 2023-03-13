import http from "http";
import * as lark from "@larksuiteoapi/node-sdk";
import { Controller } from "../controller.js";
import * as types from "../types.js";


export class LarkMessenger {
  client: lark.Client;
  server: http.Server;
  port: number;
  path: string;

  controller: Controller;

  constructor(path: string, port: number, controller: Controller) {
    this.client = new lark.Client({
      appId: process.env.LARK_APPID || "",
      appSecret: process.env.LARK_SECRET || "",
      appType: lark.AppType.SelfBuild,
      domain: lark.Domain.Feishu,
    });
    this.server = http.createServer();
    this.port = port;
    this.path = path;
    this.controller = controller;

    const eventDispatcher = new lark.EventDispatcher({}).register({
      'im.message.receive_v1': this.onMessage.bind(this),
    });

    this.server.on('request', lark.adaptDefault(
      path,
      eventDispatcher,
      { autoChallenge: true },
    ));
  }

  start() {
    this.server.listen(this.port, () => {
      return console.log(`Lark Server is listening at http://localhost:${this.port}`);
    });
  }


  private async onMessage(data: any) {
    console.log("lark.message", data);
    //console.log(data.message.mentions[0].name);
    //const chatId = data.message.chat_id;

    const messageData = data.message;
    if (messageData.message_type != "text") {
      return;
    }
    if (messageData.chat_type === "group") {
      if (!messageData.mentions) {
        return;
      }
      const mention_names = messageData.mentions.map((m: any) => m.name);
      if (mention_names.indexOf(process.env.LARK_BOT_NAME) === -1) {
        return;
      }
    }

    const replyFunc = this.makeReplyFunc(messageData.message_id);
    const content = JSON.parse(data.message.content)["text"].replace(/@_user.+ /, "");

    const sessionId = messageData.root_id ? messageData.root_id : messageData.message_id;
    const env: types.Env = {
      senderId: sessionId,
      senderName: data.sender.sender_id.user_id ,
      replyFunc: replyFunc,
      message: content,
    };

    await this.controller.onMessage(
      content,
      sessionId,
      env,
    );
  }

  private makeReplyFunc(messageId: string): Function {
    return (content: string) => {
      this.client.im.message.reply({
        path: {
          message_id: messageId,
        },
        data: {
          content: JSON.stringify({text: content }),
          msg_type: "text",
        },
      })
    };
  }
}
