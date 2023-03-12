import express from "express";


export class LarkMessenger {
  server: express.Express;
  port: number;
  path: string;


  constructor(path: string, port: number) {
    this.port = port;
    this.path = path;
    this.server = express();

    this.init();
  }

  start() {
    this.server.listen(this.port, () => {
      return console.log(`Express is listening at http://localhost:${this.port}`);
    });
  }


  private init() {
    this.server.use(express.json());

    this.server.post(this.path, (req, res) => {
      if (req.body.type === "url_verification") {
        res.json({ "challenge": req.body.challenge });
        return;
      }

      res.json({ "hi": "ok" });
    });
  }
}
