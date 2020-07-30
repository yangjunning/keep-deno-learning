import { serve } from "./deps.ts";

const s = serve({ port: 8888 });
console.log("http://localhost:8888/");

const juejin =
  "https://xiaoce-timeline-api-ms.juejin.im/v1/getListByLastTime?pageNum=1";

for await (const req of s) {
  if (req.url === "/juejin") {
    const response = await fetch(juejin);
    const jsonData = await response.json();
    req.respond({
      body: JSON.stringify(jsonData),
    });
  } else if (req.url === "/books") {
    const body = await Deno.readFile("./books.json");
    req.respond({ body: body });
  }
}
