import { serve } from "https://deno.land/std@0.62.0/http/server.ts";

const s = serve({ port: 8888 });

console.log("🦕 deno server running at http://127.0.0.1:8888/ 🦕");

for await (const req of s) {
  req.respond({ body: "Hello World\n" });
}
