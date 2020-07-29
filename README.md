大家好，我是俊宁，这是一篇介绍如何使用 Deno 构建 HTTP Server 的实践指南，如果你还不了解Deno是什么，可以移步我的另一篇[Deno入门文章](https://juejin.im/post/5f1d4065f265da22d8344dc6)。

## 环境准备

- deno: 使用 `deno -V` 查看是否正确安装了 deno
- VSCode Deno插件: 支持 Deno 开发的 VSCode 插件
- VSCode REST Client插件: 直接在VSCode中进行接口测试的插件

## 基础体验

新建 `deps.ts` 文件，并导入所需的插件：

```ts
export * from "https://deno.land/std/http/server.ts"
```

新建 `index.ts` 问价

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

## 参考

- [我为 VS Code 开发了一个 Deno 插件](https://juejin.im/post/5c81c1e8e51d45535c4fe5c2)
- [VScode中测试接口代替postman](https://blog.csdn.net/weixin_43363871/article/details/104058898)

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

## Catch Me

> GitHub: [youngjuning](https://github.com/youngjuning) | 微信: `yang_jun_ning` | 公众号: `前端早茶馆` | 邮箱: youngjuning@aliyun.com

|                                     微信                                     |                                     投食                                     |                                    公众号                                    |
| :--------------------------------------------------------------------------: | :--------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
| <img src="https://i.loli.net/2020/02/22/q2tLiGYvhIxm3Fl.jpg" width="200px"/> | <img src="https://i.loli.net/2020/02/23/q56X1eYZuITQpsj.png" width="200px"/> | <img src="https://i.loli.net/2020/07/28/6AyutjZ1XI4aUDV.jpg" width="200px"/> |

本文首发于[杨俊宁的博客](https://youngjuning.js.org/)，创作不易，您的点赞👍是我坚持的动力！！！
