/**
 * @author Longbo Ma
 */

var path = require("path"),
    config;

config = {
    name: '谷搜客',
    port: process.env.PORT || 5555,
    language: 'zh_CN',//生产环境下使用zh_CN
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
    r_prefix: "",//http下的资源前缀
    autocomplate_url: '//173.194.121.28', //http下的autocomplate请求地址(必须为没有被墙的IP)
    ssl: {
        enable: false,//设置https是否启用
        port: 5556, //https 端口
        r_prefix: "", //https下的资源前缀
        autocomplate_url: '//wen.lu', //https下的autocomplate请求地址
        key: path.join(__dirname, 'test_server.key'),
        cert: path.join(__dirname, 'test_server.crt')
    },
    proxy: { //配置http服务器代理
        enable: false,
        timeout: 5000,//设置超时时间为5s, enable为true时有效
        host: '',
        port: 80
    }
};

module.exports = config;