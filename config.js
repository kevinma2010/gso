/**
 * @author Longbo Ma
 */

var path = require("path"),
    config;

config = {
    port: 5555,
    language: 'en',//生产环境下使用zh_CN
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36',
    g_url: 'https://www.google.com.hk',
    r_prefix: "",
    ssl: {
        enable: false,//设置https是否启用
        port: 5556,
        r_prefix: "", //https下的资源前缀
        key: path.join(__dirname, 'test_server.key'),
        cert: path.join(__dirname, 'test_server.crt')
    }
};

module.exports = config;