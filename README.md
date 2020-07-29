大家好，我是俊宁，这是一篇介绍如何使用 Deno 构建 HTTP Server 的实践指南，如果你还不了解Deno是什么，可以移步我的另一篇[Deno入门文章](https://juejin.im/post/5f1d4065f265da22d8344dc6)。

## 基础版

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
2. 使用 serve 函数初始化一个 HTTP 服务
3. 使用 [for-await-of](http://s0developer0mozilla0org.icopy.site/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) 语法监听请求，`for-await-of` 语句创建一个循环，循环遍历异步可迭代对象以及同步可迭代对象

> 注意：Deno 不支持 `require` 语法。模块也不是集中管理的，而是通过 URL 导入。

## Catch Me

> GitHub: [youngjuning](https://github.com/youngjuning) | 微信: `yang_jun_ning` | 公众号: `前端早茶馆` | 邮箱: youngjuning@aliyun.com

|                                     微信                                     |                                     投食                                     |                                    公众号                                    |
| :--------------------------------------------------------------------------: | :--------------------------------------------------------------------------: | :--------------------------------------------------------------------------: |
| <img src="https://i.loli.net/2020/02/22/q2tLiGYvhIxm3Fl.jpg" width="200px"/> | <img src="https://i.loli.net/2020/02/23/q56X1eYZuITQpsj.png" width="200px"/> | <img src="https://i.loli.net/2020/07/28/6AyutjZ1XI4aUDV.jpg" width="200px"/> |

本文首发于[杨俊宁的博客](https://youngjuning.js.org/)，创作不易，您的点赞👍是我坚持的动力！！！
