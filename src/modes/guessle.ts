import { Env } from "../types.js";
import { Conversation } from "./conversation.js";
import fs from "fs";
import YAML from "yaml";
import { FileBox } from "file-box";
import {
  replyNotFoundCmd,
} from "../utils.js";

export class Guessle extends Conversation {
  answers: Array<any>;
  isFinished: boolean;
  gameID: string;

  constructor() {
    super(null);
    this.answers = [];
    this.isFinished = false;
    this.gameID = this.todayStr();
  }

  async onMessage(cmd: string | null, content: string, env: Env): Promise<void> {
    if (this.isFinished) {
      env.replyFunc("这局结束了，新开一局吧朋友");
      return;
    }

    if (cmd === "open") {
      if (this.answers.length > 0) {
        env.replyFunc("朋友这局已经开始了，直接 /guess 开猜吧");
        return;
      }
      if (content.length > 0) {
        this.gameID = content;
      }
    }

    const gameData = this.getGameData();
    if (gameData === null) {
      env.replyFunc("没找到这个局，直接 /open 吧");
      return;
    }

    switch (cmd) {
      case "guess":
        this.guess(content, gameData, env.replyFunc);
        break;
      case "open":
        this.open(gameData, env.replyFunc);
        break;
      default:
        replyNotFoundCmd(env.replyFunc, env.message);
    }

  }

  help(): string {
    return "Guessle 模式：TODO 。";
  }

  configFilename(): string {
    return "guessle";
  }

  private guess(content: string, gameData: any, replyFunc: Function) {
    this.answers.push(content);
    if (gameData["answers"].indexOf(content) > -1) {
      replyFunc(`Bingo! ${this.answers.length} 次就猜对了，NB 啊`);
      for (var r of gameData["bingo_replies"]) {
        if (r["lark_image_key"]) {
          const larkImageKey = r["lark_image_key"];
          let img = FileBox.fromUuid(larkImageKey);
          img.metadata = {
            "larkImageKey": larkImageKey
          }
          replyFunc(img);
        }
      }
      this.isFinished = true;
      return;
    }

    if (this.answers.length >= gameData["steps"].length) {
      replyFunc("猜错了，有点可惜，重新来过吧");
      this.isFinished = true;
      return;
    }

    replyFunc("猜错了，继续吧");
    this.replyNextStep(gameData, this.answers.length, replyFunc);
  }

  private open(gameData: any, replyFunc: Function) {
    replyFunc(gameData["opening"]);
    this.replyNextStep(gameData, 0, replyFunc);
  }

  private replyNextStep(gameData: any, step: number, replyFunc: Function) {
    const larkImageKey = gameData["steps"][step]["lark_image_key"];
    let img = FileBox.fromUuid(larkImageKey);
    img.metadata = {
      "larkImageKey": larkImageKey
    }
    replyFunc(img);
  }

  private getGameData() {
    const fileDir = `${this.configDir}${this.configFilename()}/data_${this.gameID}.yaml`;
    let file = "";
    try {
      file = fs.readFileSync(fileDir, "utf-8");
    } catch (err) {
      return null;
    }

    return YAML.parse(file);
  }

  private todayStr() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const formattedMonth = month < 10 ? `0${month}` : month.toString();
    const formattedDay = day < 10 ? `0${day}` : day.toString();

    const formattedDate = `${formattedMonth}${formattedDay}`;

    return formattedDate; // 输出格式化后的日期，如 '0318'
  }
}
