![](https://i.loli.net/2020/07/29/Vn7jhOu3Z2c6pTe.png)

<!--more-->

大家好，我是俊宁，这是一篇介绍如何使用 Deno 构建 HTTP Server 的实践指南，如果你还不了解Deno是什么，可以移步我的另一篇[Deno入门文章](https://juejin.im/post/5f1d4065f265da22d8344dc6)。

## 环境准备

- deno: 使用 `deno -V` 查看是否正确安装了 deno
- VSCode Deno插件: 支持 Deno 开发的 VSCode 插件
- VSCode REST Client插件: 直接在VSCode中进行接口测试的插件

## 基础体验

### 官方示例解析

```ts
import { serve } from "https://deno.land/std/http/server.ts";

const s = serve({ port: 8080 });
console.log("http://localhost:8080/");

// 一个会等待每一个请求的 for 循环
for await (const req of s) {
  console.log(req.url);
  req.respond({ body: "Hello World\n" });
}
```

让我们来看看上面这段代码做了什么:

1. 首先我们引入 server 模块: 这里使用了 ES 模块，第三方模块通过 URL 导入。

   > 注意：Deno 不支持 `require` 语法。模块也不是集中管理的，而是通过 URL 导入。
2. 使用 `serve` 函数初始化一个 HTTP 服务

3. 使用 [for-await-of](http://s0developer0mozilla0org.icopy.site/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) 语法监听请求，`for-await-of` 语句创建一个循环，循环遍历异步可迭代对象以及同步可迭代对象。

   > 注意：Deno不再捆绑在 async 函数之中，所以可以全局使用

### 解析请求体

```js
const decoder = new TextDecoder("utf-8");
const data: Uint8Array = await Deno.readAll(req.body);
const body = decoder.decode(data) ? JSON.parse(decoder.decode(data)) : {};
```

### 简易REST API

1、这个Demo提供了两个api，分别是从文件读取数据返回和从网络获取数据并返回。结合数据库的放到后面使用框架的部分讲解：

```js
import { serve } from "./deps.ts";

const s = serve({ port: 8080 });
console.log("http://localhost:8080/");

const juejin = "https://xiaoce-timeline-api-ms.juejin.im/v1/getListByLastTime?pageNum=1";

for await (const req of s) {
  if (req.url === "/books") {
    const body = await Deno.readFile("./books.json");
    req.respond({ body: body });
  } else if(req.url === "/juejin"){
    const response = await fetch(juejin);
    const jsonData = await response.json();
    req.respond({
      body: JSON.stringify(jsonData), // body 不能接受对象
    });
  }
}
```

2、执行 `deno run --allow-read --allow-net index.ts`

3、使用 VSCode  REST Client 访问一下试试：

> 注意：如果 localhost 请求失败，请使用 ip 的形式。4090ok

<img src="https://i.loli.net/2020/07/30/ibwyIrKvjJld5GQ.png" style="zoom:25%;" />

## 技术选型

截止2020年7月30日，GitHub比较热门的 HTTP Server 框架有5个，分别是 oak、servest、deno-drash、abc、pogo（排名分先后）。

起初我也和大家一样面对这么多框架不知如何选，直到使用了[Github Stars](https://github-stars.socode.pro/) 对比了他们的star趋势后，毫无犹豫的选择了 oak。

但是本着技术探究的角度，我们还是分别体验一下这5个框架的 Hello World，然后再利用oak进行实战演习。

<img src="https://i.loli.net/2020/07/30/eutq8cLTRni5W6K.png" style="zoom:35%;" />

### [Oak](https://github.com/oakserver/oak)

#### 介绍

Oak 是最有前景的 Deno HTTP server 中间件框架，包含一个 路由中间件，目前能找到的社区资源最多。这款框架的灵感来自 [Koa](https://github.com/koajs/koa)，路由中间件的灵感来自 [@koa/router](https://github.com/koajs/router/)。

#### Demo

创建一个 `server.ts` 文件并编写一个简单的 server：

```ts
import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello Oak!";
});

console.log(`🌳 oak server running at http://127.0.0.1:8001/ 🌳`)

await app.listen("127.0.0.1:8001");
```

执行 `deno run --allow-net server.ts`开启服务，并使用 VSCode REST Client 测试：

![](https://i.loli.net/2020/07/30/8q3AKy4EVLBb6Q1.png)

### [servest](https://github.com/keroxp/servest)

#### 介绍

> 用于Deno的渐进式http服务器

`Servest` 是一个适用于 Deno 的 http 模块，它由三个主要的 HTTP 协议的 API 组成

- App API: 通用HTTP路由服务器
- Server API: 处理的 HTTP/1.1 请求的低级的 HTTP API
- Agent API: 处理 HTTP/1.1 的 Keep-Alive 连接的低级API

为了实验和进步，`Servest` 在 [std/http](https://deno.land/std/http) 之外实现了自己的 HTTP/1.1 server。

#### Demo

与 std/http 高度兼容：

```ts
import { createApp } from "./deps.ts";
const app = createApp();
app.handle("/", async (req) => {
  await req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "text/plain",
    }),
    body: "Hello, Servest!",
  });
});
app.listen({ port: 8899 });
```

专为实际业务而设计：

```ts
import { createApp } from "https://servestjs.org/@v1.1.1/mod.ts";

const app = createApp();

app.post("/post", async (req) => {
  const body = await req.json();
  await req.respond({
    status: 200,
    body: JSON.stringify(body),
  });
});

app.listen({ port: 8888 });
```

支持websoket：

```ts
import { createApp } from "https://servestjs.org/@v1.1.1/mod.ts";

const app = createApp();

app.ws("/ws", async (sock) => {
  for await (const msg of sock) {
    if (typeof msg === "string") {
      console.log("[index]", msg);
      // handle messages...
    }
  }
});

app.listen({ port: 8888 });
```

内置 jsx/tsx 支持，无需任何配置：

> 默认情况下，JSX文件（`.jsx`，`.tsx`）将由 `React.createElement()`转换。因此，您必须在jsx/tsx文件的头上导入React。

```ts
// @deno-types="https://servestjs.org/@v1.1.1/types/react/index.d.ts"
import React from "https://dev.jspm.io/react/index.js";
// @deno-types="https://servestjs.org/@v1.1.1/types/react-dom/server/index.d.ts"
import ReactDOMServer from "https://dev.jspm.io/react-dom/server.js";
import { createApp } from "https://servestjs.org/@v1.1.1/mod.ts";

const app = createApp();

app.handle("/", async (req) => {
  await req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "text/html; charset=UTF-8",
    }),
    // @ts-ignore
    body: ReactDOMServer.renderToString(
      <html>
        <head>
          <meta charSet="utf-8" />
          <title>servest</title>
        </head>
        <body>
          <h1>Hello Servest!</h1>
        </body>
      </html>,
    ),
  });
});

app.listen({ port: 8899 });
```

### [deno-drash](https://github.com/drashland/deno-drash)

### [abc](https://github.com/zhmushan/abc)

### [Pogo](https://github.com/sholladay/pogo)

Pogo是用于编写Web服务器和应用程序的易于使用，安全且富有表现力的框架，它的灵感来自 hapi。

## 插件推荐

### [denv](https://deno.land/x/denv#denv)

一个适用于 Deno 的类似于 [dotenv](https://github.com/motdotla/dotenv)的插件

**使用**

你可以直接导入它，然后就可以使用和它同级目录的`.env` 文件：

```ts
import "https://deno.land/x/denv/mod.ts";
console.log(Deno.env.get("HOME"));  // e.g. outputs "/home/alice"
console.log(Deno.env.get("MADE_UP_VAR"));  // outputs "Undefined"
```

**Env File 规则**

除了 `double quoted values expand new lines` 没有实现，其他的规则和 dotenv 一样。

## 打包

`deno bundle` 自带打包和 tree shaking 功能，可以将我们的代码打包成单文件

```shell
#!/bin/sh
deno bundle ./src/index.ts ./dist/index.js
```

`deno install` 可以将我们的代码生成可执行文件进行直接使用

```shell
#!/bin/sh
deno install --allow-read  --allow-net --allow-write -n youngjuning ./src/index.ts
```

deno的可执行文件默认都放在 `/Users/yangjunning/.deno/bin/` 目录下，我们需要将它注册到环境变量中:

```sh
$ export PATH="/Users/yangjunning/.deno/bin:$PATH"
```

## 参考

- [我为 VS Code 开发了一个 Deno 插件](https://juejin.im/post/5c81c1e8e51d45535c4fe5c2)
- [VScode中测试接口代替postman](https://blog.csdn.net/weixin_43363871/article/details/104058898)

## Catch Me

> GitHub: [youngjuning](https://github.com/youngjuning) | 微信: `yang_jun_ning` | 公众号: `前端早茶馆` | 邮箱: youngjuning@aliyun.com

|                                     微信                                     |                                     投食                                     |                                    公众号                                    |
| :--------------------------------------------------------------------------: | :--------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
| <img src="https://i.loli.net/2020/02/22/q2tLiGYvhIxm3Fl.jpg" width="200px"/> | <img src="https://i.loli.net/2020/02/23/q56X1eYZuITQpsj.png" width="200px"/> | <img src="https://i.loli.net/2020/07/28/6AyutjZ1XI4aUDV.jpg" width="200px"/> |

本文首发于[杨俊宁的博客](https://youngjuning.js.org/)，创作不易，您的点赞👍是我坚持的动力！！！
