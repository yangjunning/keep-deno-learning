import { ServerRequest } from "./deps.ts";

export default (req: ServerRequest) => {
  return "Hello Deno!!" + req.url;
};
