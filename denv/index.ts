import { load } from "https://deno.land/x/denv/mod.ts";
await load();
console.log(Deno.env.get("HOME")); // e.g. outputs "/home/alice"
console.log(Deno.env.get("APP_PORT")); // outputs "Undefined"
