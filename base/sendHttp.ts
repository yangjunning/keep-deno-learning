// 我们取得了第一个命令行参数，存储到变量 url。
const url = Deno.args[0];
// 我们向指定的地址发出请求，等待响应，然后存储到变量 res。
const res = await fetch(url);

// 我们把响应体解析为一个 ArrayBuffer，等待接收完毕，将其转换为 Uint8Array，最后存储到变量 body。
const body = new Uint8Array(await res.arrayBuffer());
// 我们把 body 的内容写入标准输出流 stdout。
await Deno.stdout.write(body);
