const DREAMILY_API_URI = "http://if.caiyunai.com/v2/api/bot_ai";

// default parameters
const DEFAULT_REGION = "China";
const DEFAULT_MID = "60094a2a9661080dc490f75a"; // Story Style: 细节狂魔
const PLATFORM = "open.caiyunapp.com"; // I don"t know what this parameter means

export class DreamilyAPIError extends Error {
  httpStatus?: number;
  httpStatusMessage?: string;
  responseStatus?: number;
  responseMessage?: string;
};

export class DreamilyAPI {
  constructor(token: string, region: string = DEFAULT_REGION) {
    if (!token) {
      console.warn("DreamilyAPI.error.constructor", "missing token");
      throw new DreamilyAPIError("missing token");
    }

    this.token = token;
    this.region = region;
  }

  async continue(content: string, universeId: string, length: number = 200): Promise<string> {
    const body = {
      value: content,
      universe_id: universeId,
      length: length,
      user_id: this.token,
      platform: PLATFORM,
      mid: DEFAULT_MID,
      regin: this.region,
    };

    const res = await fetch(DREAMILY_API_URI, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn("DreamilyAPI.error.continue", res.status, res.statusText);
      let err = new DreamilyAPIError("Request Failed");
      err.httpStatus = res.status;
      err.httpStatusMessage = res.statusText;
      throw err;
    }

    const ret = await res.json();
    if (ret["status"] != 0) {
      console.warn("DreamilyAPI.error.continue", ret["status"], ret["msg"]);
      let err = new DreamilyAPIError("Unknown Error");
      err.httpStatus = res.status;
      err.httpStatusMessage = res.statusText;
      err.responseStatus = ret["status"];
      err.responseMessage = ret["msg"];
      throw err;
    }

    return ret["data"]["row"];
  }

  private token: string;
  private region: string;
}
