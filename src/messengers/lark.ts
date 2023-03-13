import express from "express";

const FEISHU_API_BASE_URL = "https://open.feishu.cn/open-apis";
const FEISHU_REQ_HEADER = { "Content-Type": "application/json; charset=utf-8" };


export class LarkMessenger {
  server: express.Express;
  port: number;
  path: string;

  auth_token: string;
  auth_token_expire_at: number;


  constructor(path: string, port: number) {
    this.port = port;
    this.path = path;
    this.server = express();

    this.auth_token = "";
    this.auth_token_expire_at = -1;

    this.init();
  }

  start() {
    this.server.listen(this.port, () => {
      return console.log(`Express is listening at http://localhost:${this.port}`);
    });
  }


  private init() {
    this.server.use(express.json());
    this.refresh_auth_token();

    this.server.post(this.path, (req, res) => {
      console.log("lark:", req.body);
      if (req.body.type === "url_verification") {
        res.json({ "challenge": req.body.challenge });
        return;
      }

      res.json({ "status": "ok" });
    });
  }

  private reply() {
  }

  private async refresh_auth_token() {
    if (this.auth_token && this.auth_token_expire_at > +new Date) {
      return;
    }

    const res = await fetch(FEISHU_API_BASE_URL + "/auth/v3/tenant_access_token/internal", {
      method: "POST",
      headers: FEISHU_REQ_HEADER,
      body: JSON.stringify({
        "app_id": process.env.LARK_APPID,
        "app_secret": process.env.LARK_SECRET,
      }),
    });

    if (!res.ok) {
      console.warn("lark.refresh_auth_token.error", res.status, res.statusText);
      return;
    }

    const ret = await res.json();
    if (ret["code"] === 0) {
      this.auth_token = ret["tenant_access_token"];
      this.auth_token_expire_at = +new Date + ret["expire"] - 10*60;
    } else {
      console.warn("lark.refresh_auth_token.error", ret["msg"]);
    }
  }
}
