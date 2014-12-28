gso(Google So)
===

这是一个用Node.JS编写的Google搜索服务，原理是拿着用户的关键词去Google服务器搜索，然后将返回的结果响应给用户。

[可用服务列表](https://github.com/lenbo-ma/gso/wiki/%E5%8F%AF%E7%94%A8%E6%9C%8D%E5%8A%A1%E5%88%97%E8%A1%A8)

关于证书的说明：文件列表中提供的证书仅为测试使用，在生产环境下需替换为你自己的证书

----

## 部署
### 安装：

```sh
git clone https://github.com/lenbo-ma/gso.git
cd gso
npm install --production
```

### 运行：

测试/调试：
`npm start` 或 `node ./bin/run`

或使用[forever](https://github.com/nodejitsu/forever)启动(推荐在生产环境中使用forever管理)
`forever start -e err.log -o output.log ./bin/run`

或使用[pm2](https://github.com/Unitech/pm2)启动
`pm2 start ./bin/run -i max`

## 自定义设置
### 统计脚本
将脚本粘贴到views/partials/statistics.ejs文件中即可

### 首页随机文字
将文字粘贴到data/words.txt中，每句以一个空行分割, 支持html代码

### 设置多个Google IP防止被屏蔽
将可用的IP放入conf/ip.txt文件中,每个ip以一个回车换行分割.

## 设置HTTP代理服务器
有时,我们可能需要设置一个代理服务器,比如google的ip失效暂时无法使用或被google屏蔽的时候.
修改conf/config.js文件, 找到proxy节点:

```javascript
proxy: { 
      enable: false,  //设置是否启用
      timeout: 5000,  //设置超时时间, enable为true时有效
      host: '',  //代理服务器地址
      port: 80  //代理服务器端口
  }
```

## 完成记录
1. 增加“相关搜索”功能;
2. OpenSearch, 支持IE，Firefox，Chrome设置为默认搜索引擎;
3. 简单的敏感词检测，否则连接会被墙/连接重置;
4. HTML代码压缩，基于html-minifier模块进行压缩已渲染好的HTML代码;
5. headroom功能(当页面向下滚动时，搜索区消失，当页面向上滚动时，搜索区又出现了。个人觉得这个体验对小屏幕笔记本及pad比较好，尤其是手机终端);
6. 实现HTTPS功能(关键词加密);
7. 使用cheeio替代jQuery解析;
8. 输入框自动完成;
9. 搜索内容语言切换;
10. 根据时间段筛选结果;
11. 使用filetype指令搜索时，结果项前缀显示filetype;
12. 支持设置多个Google IP(2014-12-25);
13. 增加HTTP代理功能(2014-12-28);

## TODO
1. [ ] Pad显示优化，字体优化;
2. [ ] 优化手机端使用体验;
3. [ ] 支持键盘快捷键;
4. [ ] 支持维基百科检索;
5. [ ] 优化错误日志记录;
6. [ ] 支持视频元信息检索(同时检索可播放来源)
7. [ ] 增加在线代理功能(代理搜索结果中出现的部分被屏蔽的网站)；
