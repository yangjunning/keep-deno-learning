import { serve } from "https://deno.land/std/http/server.ts";

const s = serve({ port: 8080 });

for await (const req of s) {
  console.log(req.url);
  req.respond({ body: "Hello World\n" });
}
