import "https://deno.land/x/denv/mod.ts";
import { Application } from "./deps.ts";

const APP_NAME = Deno.env.get("APP_NAME") || 'oak'
const APP_PORT = Deno.env.get("APP_PORT") || 1994
const EXPORT = Deno.env.get("APP_HOST") || 1998
const APP_HOST = Deno.env.get("APP_HOST") || '127.0.0.1'

const app = new Application();

// Logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

// Timing
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Hello World!
app.use((ctx) => {
  ctx.response.body = "Hello World!";
});

console.log(`🦕 ${APP_NAME} running at http://${APP_HOST}:${EXPORT}/ 🦕`);

await app.listen({ port: Number(APP_PORT) });
