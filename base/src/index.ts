import { serve } from "./deps.ts";
import handler from "./handler.ts";

const decoder = new TextDecoder("utf-8");
const encoder = new TextEncoder();
const s = serve({ port: 8080 });
console.log("http://localhost:8080/");
const juejin =
  "https://xiaoce-timeline-api-ms.juejin.im/v1/getListByLastTime?pageNum=1";
for await (const req of s) {
  const data: Uint8Array = await Deno.readAll(req.body);
  const body = decoder.decode(data) ? JSON.parse(decoder.decode(data)) : {};
  console.log("[body]", body);
  if (req.url === "/") {
    req.respond({ body: handler(req) });
  } else if (req.url === "/books") {
    const response = await fetch(juejin);
    const jsonData = await response.json();
    req.respond({
      body: JSON.stringify(jsonData),
    });
  } else {
    const body = await Deno.readFile("./books.json");
    req.respond({ body: body });
  }
}
