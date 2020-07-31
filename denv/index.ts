import "https://deno.land/x/denv/mod.ts";
console.log(Deno.env.get("HOME")); // e.g. outputs "/home/alice"
console.log(Deno.env.get("APP_PORT")); // outputs "Undefined"
