/**
 * @author Longbo Ma
 */
var request = require('./request');
var cookieUtil = require('cookie');
var cheerio = require('cheerio');
var config = require('../conf/config');
var mobile = require('../lib/mobile');
var autoIP = require('./autoIP');
var constant = require('./constant');
var cookie = require('./cookie');

//语言筛选项
var content_language_matrix = constant.lrArr;

//时间筛选选项
var qdr = constant.qdrArr;

var gsearch = function (options, cb) {
    options = options || {};
    options.start = options.start || 0;
    this.callback = cb || function(s){};
    this.userAgent = options.userAgent || config.userAgent;
    this.cookies = options.cookies;
    this.mode = options.mode || "html";
    this.result = {};

    var qs = this.qs = {
        ie: 'utf-8',//输入编码
        oe: 'utf-8',//输出编码, 否则ua被篡改为无效后会导致搜索结果乱码
        start: options.start, //控制页数
        q: options.q, //查询关键词
        num: options.num || 10,
        hl: config.language, //界面语言
    };
    
    if (options.lr) {//搜索内容语言,不是界面语言
        qs.lr = isNaN(options.lr) ? '' : content_language_matrix[parseInt(options.lr)] || '';
    }

    if (options.tbs) {//时间筛选选项
        qs.tbs = isNaN(options.tbs) ? '' : qdr[parseInt(options.tbs)] || '';
    }
    this.getUrl();
};

/**
 * 获取Google查询地址
 */
gsearch.prototype.getUrl = function () {
    var ip,i = 0,retryCount = 8;
    //获取随机ip，如果无效，最多重试8次
    do {
        ip = autoIP.get();
        if (ip) {
            i = retryCount;
        } else {
            i++;
        }
    }
    while (i < retryCount);
    this.g_url = 'http://'+ip;
    console.log(this.g_url );
};

/**
 * 根据UserAgent检查是否为移动端请求
 **/
gsearch.prototype.checkMobile = function () {
    var isMobile = this.isMobile = mobile.isMobile(this.userAgent);
    if (isMobile) {
        //转换为PC端UA
        this.userAgent = config.userAgent;
    }
    this.result.isMobile = isMobile;
};

/**
 * 解析html数据
 **/
gsearch.prototype.parseResponse = function (body) {
    var arr = [], $, search, resultStats, sItem, link, url;
    $ = cheerio.load(body);
    search = $("#search").find("li.g");//搜索结果列表
    resultStats = $("#resultStats").html() || ""; //记录搜索用时区域文字
    for (var i = 0; i < search.length; i++) {
        sItem = $(search[i]);
        link = sItem.find("h3.r a"); //结果项的标题部分
        url = link.attr("data-href") || link.attr("href"); //url地址
        if (url && url.indexOf('/search?') !== 0) {
            var title, filetype, content, cite;
            filetype = sItem.find("span._ogd").html();
            cite = sItem.find("cite").html(); //url区域代码

            if (this.mode === 'html') {
                title = link.html(); //标题文字
                content = sItem.find("span.st").html(); //说明文字区域代码
            } else {
                title = link.text(); //标题文字
                content = sItem.find("span.st").text(); //说明文字区域代码
            }

            arr.push({
                title: title,
                url: url,
                cite: cite,
                content: content,
                filetype: filetype
            });
        }
    }


    var hasExtrares = false, //标记是否有相关搜索
        extrares = {},  //存储相关搜索数据
        exTitle; //相关搜索的标题

    exTitle = $("#brs h3").html();
    if (exTitle) {
        var brs_cols, _brs_cols = [];
        hasExtrares = true;
        extrares.title = exTitle;
        brs_cols = $("div.brs_col");

        for (var i = 0; i < brs_cols.length; i++) {
            var _cols = $(brs_cols[i]).find('a'),
                _col = [];
            for (var j = 0; j < _cols.length; j++) {
                var _text, _html;
                _html = $(_cols[j]).html();
                _text = encodeURI($(_cols[j]).text().replace(/[ ]/g, "+"));
                // console.log(_text);
                _col.push({
                    content: _html,
                    url: '/search?q='+_text
                });
            }
            _brs_cols.push(_col);
        }

        extrares.arr = _brs_cols;
        // console.log(extrares);
    }
    extrares.has = hasExtrares;
    
    this.result['extrares'] = extrares;
    this.result['resultStats'] = resultStats;
    this.result['data'] = arr;
};

/**
 * 响应搜索结果
 * @param  {[String]} body [google响应的html代码]
 */
gsearch.prototype.render = function (body) {
    this.parseResponse(body); //解析
    this.callback(null,this.result); //返回数据
};

/**
 * 发送查询请求
 **/
gsearch.prototype.request = function () {
    var self = this,
        qs = this.qs,
        cookies = this.cookies,
        g_url = this.g_url;

    if (!qs.q) {
        this.callback([]);
        return;
    }

    this.checkMobile();
    
    var headers = {
        'accept-language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
        'user-agent': this.userAgent
    };

    if (cookies) {
        headers['cookie'] = cookie.parseRequestCookies(cookies);
    }

    var options = {
        url: g_url+'/search',
        headers: headers,
        qs: qs
    };

    //设置超时时间
    if (config.proxy.enable) {
        options.timeout = config.proxy.timeout;
    }

    //发送请求
    request(options, function (err, res, body) {
        if (err) {
            //如果响应超时并启用了http proxy, 则使用代码重新发送请求
            var code = err.code;
            if ((code === 'ESOCKETTIMEDOUT' || code === 'ETIMEDOUT') && config.proxy.enable) {
                self.useProxy(options);
                return;
            }
            self.callback(err);//响应其它错误
            return;
        }
        //检测是否被屏蔽,是则使用代理重新请求
        if (self.isBlocked(body)) {
            if (config.proxy.enable) {
                self.useProxy(options);
                return;
            } else {
                self.callback('谷哥说歇一会儿再查吧......................');
                return;
            }
        } else {
            //解析Google响应的Cookies
            self.result.cookies = cookie.parseGoogleCookies(res.headers['set-cookie']);
            self.render(body);
            return;
        }
    });
};

/**
 * 使用代理请求
 * @param  {[Object]} options [请求设置项]
 */
gsearch.prototype.useProxy = function (options) {
    var self = this;
    delete options.timeout;//删除超时时间设置
    options.host = config.proxy.host;
    options.port = config.proxy.port;
    console.log('useProxy..........................');
    request(options, function (err, res, body) {
        if (err) {
            self.callback(err);
            return;
        }
        self.result.cookies = cookie.parseGoogleCookies(res.headers['set-cookie']);
        self.render(body);
    });
};

/**
 * 检测是否被屏蔽
 * @param  {[String]}  body [Google响应的HTML代码]
 * @return {Boolean}
 */
gsearch.prototype.isBlocked = function (body) {
    var $ = cheerio.load(body);
    return $('div.hdtb_imb').length === 0;
};

module.exports = function (options,cb) {
    new gsearch(options,cb).request();
};
