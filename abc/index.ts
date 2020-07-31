import { Application } from "https://deno.land/x/abc@v1/mod.ts";

const app = new Application();

app.get("/hello", () => {
  return "Hello, Abc!";
});

app.start({ port: 8888 });

console.log(`🦕 abc server running at http://127.0.0.1:8888/ 🦕`);
