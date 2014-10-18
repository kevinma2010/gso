gso
===
这是一个用NodeJs编写的Google搜索服务，原理是拿着用户的关键词去Google服务器搜索，然后将返回的结果响应给用户。

关于证书的说明：
文件列表中提供的证书仅为测试使用，在生产环境下需替换为你自己的证书

安装：

`git clone https://github.com/lenbo-ma/gso.git`

`cd gso`

`npm install --production`(注意是两个-)


Run:

`node ./bin/run` 或 `npm start`

或使用[forever](https://github.com/nodejitsu/forever)启动(推荐在生产环境中使用forever管理)

`forever start -e err.log -o output.log ./bin/run`

或使用[pm2](https://github.com/Unitech/pm2)启动

`pm2 start ./bin/run -i max`

最近新增:

1. 增加“相关搜索”功能；
2. opensearch, 支持IE,Firefox,Chrome设置为默认搜索引擎；
3. 简单的敏感词检测，否则连接会被qiang重置；
4. html代码压缩，使用html-minifier模块进行压缩已渲染好的html代码；
5. headroom功能(当页面向下滚动时，搜索区消失，当页面向上滚动时，搜索区又出现了。个人觉得这个体验对小屏幕笔记本及pad比较好，尤其是手机终端); 
6. 实现https功能(关键词加密);
7. 优化手机端使用体验;
8. 使用cheeio替代jquery解析;

todo：

1. pad显示优化，字体优化;
2. 输入框自动完成;
3. 搜索内容语言切换
4. 根据时间段筛选结果;
5. 增加在线代理功能(代理搜索结果中出现的部分被屏蔽的网站)；

[可用服务列表](https://github.com/lenbo-ma/gso/wiki/%E5%8F%AF%E7%94%A8%E6%9C%8D%E5%8A%A1%E5%88%97%E8%A1%A8)
