import promptSync from "prompt-sync";
import { Controller } from "./controller.js";
import * as types from "./types.js";
import os from "os";


export class Cli {
  controller: Controller;

  constructor(controller: Controller) {
    this.controller = controller;
  }

  async start() {
    while (true) {
      const input = this.prompt(">");
      if (!input) {
        continue;
      }

      const env: types.Env = {
        senderId: os.hostname(),
        senderName: os.hostname(),
      };
      const sessionId = os.hostname();

      await this.controller.onMessage(
        input,
        sessionId,
        console.log,
        env,
      );
    }
  }

  private prompt = promptSync({ sigint: true });
}
