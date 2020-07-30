import "https://deno.land/x/denv/mod.ts";
import { Application } from "./deps.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello world!";
});

console.log(`🌳 oak server running at http://127.0.0.1:8001/ 🌳`);

await app.listen("127.0.0.1:8001");
