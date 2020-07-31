import { Drash } from "https://deno.land/x/drash@v1.x/mod.ts";

class HomeResource extends Drash.Http.Resource {
  static paths = ["/"];
  public GET() {
    this.response.body = "Hello World!";
    return this.response;
  }
}

const server = new Drash.Http.Server({
  response_output: "text/html",
  resources: [HomeResource],
});

server.run({
  hostname: "127.0.0.1",
  port: 8888,
});

console.log(`🦕 drash server running at http://127.0.0.1:8888/ 🦕`);
