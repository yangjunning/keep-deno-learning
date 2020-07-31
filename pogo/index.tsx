import React from "https://dev.jspm.io/react";
import pogo from "https://deno.land/x/pogo/main.ts";

const server = pogo.server({ port: 8888 });

server.router.get("/", () => {
  return <h1>Hello, world!</h1>;
});

server.start();

console.log(`🦕 pogo server running at http://127.0.0.1:8888/ 🦕`);
