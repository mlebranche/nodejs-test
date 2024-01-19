import { HandlerResponse } from "types/handlerResponse";

export class HTTPError extends Error {
  static Forbidden = new HTTPError(403, "Forbidden");
  static NotFound = new HTTPError(404, "Not found");

  constructor(readonly statusCode: number, msg: string = "HTTP_ERROR") {
    super(msg);
  }

  toHTTPResponse(): HandlerResponse {
    return { statusCode: this.statusCode };
  }
}
