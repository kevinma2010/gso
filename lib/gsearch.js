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
    this.result = {};

    var qs = this.qs = {
        ie: 'utf-8',//输入编码
        oe: 'utf-8',//输出编码, 否则ua被篡改为无效后会导致搜索结果乱码
        start: options.start,
        q: options.q,
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
        this.userAgent = config.userAgent;
    }
    this.result.isMobile = isMobile;
};

/**
 * 解析html数据
 **/
gsearch.prototype.parseResponse = function (body) {
    var arr = [];
    var $ = cheerio.load(body);
    var search = $("#search").find("li.g");
    var resultStats = $("#resultStats").html() || "";
//    console.log(search.length);
    for (var i = 0; i < search.length; i++) {
        var sItem = $(search[i]);
        var link = sItem.find("h3.r a");
        var url = link.attr("data-href") || link.attr("href");
        if (url && url.indexOf('/search?') !== 0) {
            var title = link.html();
            var filetype = sItem.find("span._ogd").html();
            var content = sItem.find("span.st").html();
            var cite = sItem.find("cite").html();
//            console.log("title:  " + title);
//            console.log("url: " + url);
//            console.log("content: " + content);
//            console.log("cite: " + cite);
//            console.log("\n\n");

            arr.push({
                title: title,
                url: url,
                cite: cite,
                content: content,
                filetype: filetype
            });
        }
    }


    var hasExtrares = false, extrares = {};
    var exTitle = $("#brs h3").html();
    if (exTitle) {
        var brs_cols, _brs_cols = [];
        hasExtrares = true;
        extrares.title = exTitle;
        brs_cols = $("div.brs_col");

        for (var i = 0; i < brs_cols.length; i++) {
            var _cols = $(brs_cols[i]).find('a');
            var _col = [];
            for (var j = 0; j < _cols.length; j++) {
                var _text = $(_cols[j]).text();
                var _html = $(_cols[j]).html();
                _text = _text.replace(/[ ]/g, "+");
                _text = encodeURI(_text);
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

gsearch.prototype.render = function (body) {
    this.parseResponse(body);
    this.callback(null,this.result);
};

/**
 * 发送查询请求
 **/
gsearch.prototype.request = function () {
    var self = this;
    if (!this.qs.q) {
        this.callback([]);
        return;
    }
    this.checkMobile();
    
    var headers = {
        'accept-language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
        'user-agent': this.userAgent
    };

    if (this.cookies) {
        headers['cookie'] = cookie.parseRequestCookies(this.cookies);
    }

    // console.log(headers);
    var options = {
        url: this.g_url+'/search',
        headers: headers,
        qs: this.qs
    };
    //设置超时时间
    if (config.proxy.enable) {
        options.timeout = config.proxy.timeout;
    }
    // console.log(this.qs);
//    console.log('open request...');
    request(options, function (err, res, body) {
        if (err) {
            var code = err.code;
            if ((code === 'ESOCKETTIMEDOUT' || code === 'ETIMEDOUT') && config.proxy.enable) {
                self.useProxy(options);
                return;
            }
            self.callback(err);
            return;
        }
        //检测是否被屏蔽,是则使用代理重新请求
        if (self.isBlocked(body)) {
            if (config.proxy.host) {
                self.useProxy(options);
            } else {
                self.callback('谷哥说歇一会儿再查吧......................');
            }
        } else {
            self.result.cookies = cookie.parseGoogleCookies(res.headers['set-cookie']);
            self.render(body);
        }
    });
};

/**
 * 使用代理请求
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
gsearch.prototype.useProxy = function (options) {
    var self = this;
    delete options.timeout;
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
 * @param  {[type]}  body [description]
 * @return {Boolean}      [description]
 */
gsearch.prototype.isBlocked = function (body) {
    var $ = cheerio.load(body);
    return $('div.hdtb_imb').length === 0;
};

module.exports = function (options,cb) {
    new gsearch(options,cb).request();
};
