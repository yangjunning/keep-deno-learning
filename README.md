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

起初我也和大家一样面对这么多框架不知如何选，直到使用了[Star History](https://star-history.t9t.io/) 对比了他们的star趋势后，毫无犹豫的选择了 oak。

但是本着技术探究的角度，我们还是分别体验一下这5个框架的 Hello World，然后再利用oak进行实战演习。

[<img src="https://i.loli.net/2020/08/01/w6FZXsfHQ4gydcK.png" style="zoom:45%;" />](https://star-history.t9t.io/#oakserver/oak&keroxp/servest&drashland/deno-drash&zhmushan/abc&sholladay/pogo)

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

console.log(`🦕 oak server running at http://127.0.0.1:8001/ 🦕`)

await app.listen("127.0.0.1:8001");
```

执行 `deno run --allow-net server.ts`开启服务，并使用 VSCode REST Client 测试：

![](https://i.loli.net/2020/07/30/8q3AKy4EVLBb6Q1.png)

编写一个拥有两个自定义中间件的Demo:

```ts
import { Application } from "https://deno.land/x/oak/mod.ts";

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

console.log(`🦕 oak server running at http://127.0.0.1:8889/ 🦕`);

await app.listen({ port: 8889 });
```

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

```ts
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
```

### [abc](https://github.com/zhmushan/abc)

```ts
import { Application } from "https://deno.land/x/abc@v1/mod.ts";

const app = new Application();

app.get("/hello", () => {
  return "Hello, Abc!";
});

app.start({ port: 8888 });

console.log(`🦕 abc server running at http://127.0.0.1:8888/ 🦕`);
```

### [Pogo](https://github.com/sholladay/pogo)

Pogo是用于编写Web服务器和应用程序的易于使用，安全且富有表现力的框架，它的灵感来自 hapi。

```ts
import React from "https://dev.jspm.io/react";
import pogo from "https://deno.land/x/pogo/main.ts";

const server = pogo.server({ port: 8888 });

server.router.get("/", () => {
  return <h1>Hello, world!</h1>;
});

server.start();

console.log(`🦕 pogo server running at http://127.0.0.1:8888/ 🦕`);
```

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
$ deno bundle ./src/index.ts ./dist/index.js
```

`deno install` 可以将我们的代码生成可执行文件进行直接使用

```shell
$ deno install --allow-read  --allow-net --allow-write -n youngjuning ./src/index.ts
```

deno的可执行文件默认都放在 `/Users/yangjunning/.deno/bin/` 目录下，我们需要将它注册到环境变量中:

```sh
$ export PATH="/Users/yangjunning/.deno/bin:$PATH"
```

## mongodb & docker

### 初始配置

```sh
# 不带权限校验的模式开启 mongo
$ docker run -d \
  --restart always \
  --name mongo \
  -v mongo_data:/data/db \
  -p 27017:27017 \
  mongo \
# mongodb 默认不开启验证，只要能访问服务器，即可直接登录，所以需要配置一下账号密码进行校验。
$ docker exec -it mongo mongo admin
# 创建超级管理员
> db.createUser({ user: "root" , pwd: "123456", roles: ["root"]});
Successfully added user: {
   "user" : "root",
   "roles" : ["root"]
}
# 尝试使用上面创建的用户信息进行连接。
> db.auth("root","123456")
1
# 创建一个名为 admin，密码为 123456 的用户。
> db.createUser({ user: "admin", pwd: "123456", roles:["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]});
Successfully added user: {
   "user": "admin",
   "roles": [
   {
      "role": "userAdminAnyDatabase",
      "db": "admin"
   }
  ]
}
# 尝试使用上面创建的用户信息进行连接。
> db.auth("admin","123456")
1
```

### 启动 mongodb

```sh
$ docker run -d \
  --restart always \
  --name mongo \
  -v mongo_data:/data/db \
  -p 27017:27017 \
  mongo \
  --auth
```

## Docker 部署

### deps.ts

```ts
export { Application } from "https://deno.land/x/oak/mod.ts";
```

### app.ts

```ts
import "https://deno.land/x/denv/mod.ts";
import { Application } from "./deps.ts";

const APP_NAME = Deno.env.get("APP_NAME") || 'oak'
const APP_PORT = Deno.env.get("APP_PORT") || 1994
const EXPORT = Deno.env.get("APP_HOST") || 1998
const APP_HOST = Deno.env.get("APP_HOST") || '127.0.0.1'

const app = new Application();

// Hello World!
app.use((ctx) => {
  ctx.response.body = "Hello World!";
});

console.log(`🦕 ${APP_NAME} running at http://${APP_HOST}:${EXPORT}/ 🦕`);

await app.listen({ port: Number(APP_PORT) });
```

### .env

使用 `.env` 是为了在脚本和程序间共享变量，方便之后统一修改。

```
APP_HOST_NAME=127.0.0.1
APP_NAME=oak-server
APP_PORT=1994
EXPORT=1998
```

### Dockerfile

```s
FROM hayd/alpine-deno

# The port that your application listens to.
EXPOSE 1994

WORKDIR /app

# Prefer not to run as root.
USER deno

# Cache the dependencies as a layer (the following two steps are re-run only when deps.ts is modified).
# Ideally cache deps.ts will download and compile _all_ external files used in main.ts.
COPY deps.ts .
RUN deno cache deps.ts

# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache app.ts

CMD ["run", "--allow-read", "--allow-env", "--allow-net", "app.ts"]
```

### publish.sh

```sh
#!/bin/bash
ENV_FILE=$(cd ./$(dirname ${BASH_SOURCE[0]}); pwd )
source $ENV_FILE/.env
_APP_NAME=$APP_NAME
APP_NAME=${_APP_NAME:-"deno_server"}

# 停止已有容器
docker rm -f ${APP_NAME}
docker rm -f mongo-oak

# 启动 mongo 容器
docker run -itd \
  --restart always \
  --name mongo-oak \
  -v mongo_data_oak:/data/db \
  -p 27017:27017 \
  --auth
  mongo

# 构建新镜像
docker build -t ${APP_NAME} .

# 启动新容器
docker run -itd \
  --restart always \
  --link mongo-oak:mongo \
  -p 1998:1994 \
  --name ${APP_NAME} \
  ${APP_NAME}
```

### mongodb 设置

### 使用

1、给脚本赋予可执行权限：`chmod a+x ./publish.sh`

2、构建镜像并发布容器：`./publish.sh`

3、

## 参考

- [我为 VS Code 开发了一个 Deno 插件](https://juejin.im/post/5c81c1e8e51d45535c4fe5c2)
- [VScode中测试接口代替postman](https://blog.csdn.net/weixin_43363871/article/details/104058898)

## Catch Me

> GitHub: [youngjuning](https://github.com/youngjuning) | 微信: `yang_jun_ning` | 公众号: `前端早茶馆` | 邮箱: youngjuning@aliyun.com

|                                     微信                                     |                                     投食                                     |                                    公众号                                    |
| :--------------------------------------------------------------------------: | :--------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
| <img src="https://i.loli.net/2020/02/22/q2tLiGYvhIxm3Fl.jpg" width="200px"/> | <img src="https://i.loli.net/2020/02/23/q56X1eYZuITQpsj.png" width="200px"/> | <img src="https://i.loli.net/2020/07/28/6AyutjZ1XI4aUDV.jpg" width="200px"/> |

本文首发于[杨俊宁的博客](https://youngjuning.js.org/)，创作不易，您的点赞👍是我坚持的动力！！！
