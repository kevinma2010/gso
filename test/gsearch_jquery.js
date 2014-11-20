/**
 * @author Longbo Ma
 */
var request = require('../lib/request');
var $ = require('jQuery');
var config = require('../config');
var mobile = require('../lib/mobile');

var gsearch = function (options, cb) {
//    console.log('new gsearch...');
    options = options || {};
    this.start = options.start || 0;
    this.q = options.q;
    this.callback = cb || function(s){};
    this.userAgent = options.userAgent || config.userAgent;
    if (options.lr) {//搜索内容语言,不是界面语言
        switch (options.lr) {
            case '0'://所有语言
                this.lr = '';
                break;
            case '1'://简体中文
                this.lr = 'lang_zh-CN';
                break;
            case '2'://繁体中文
                this.lr = 'lang_zh-TW';
                break;
            case '3'://所有中文
                this.lr = 'langzh-CN|langzh-TW';
                break;
            case '4'://英文
                this.lr = 'lang_en';
                break;
            case '5'://韩文
                this.lr = 'lang_ko';
                break;
            case '6'://日文
                this.lr = 'lang_ja';
                break;
            case '7'://法文
                this.lr = 'lang_fr';
                break;
            case '8'://德文
                this.lr = 'lang_de';
                break;
            case '9'://西班牙
                this.lr = 'lang_es';
                break;
            case '10'://意大利
                this.lr = 'lang_it';
                break;
            default:
                this.lr = '';
        }   
    }
    this.result = {};
    // console.log(this.result);
    this.config = {
        base_url: config.g_url,
        lang: config.language
    };
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
    console.time("gsearch_jquery");
    var arr = [];
    var doc = $(body);
    var search = doc.find("#search").find("li.g");
    var resultStats = doc.find("#resultStats").html() || "";
//    console.log(search.length);
    for (var i = 0; i < search.length; i++) {
        var sItem = $(search[i]);
        var link = sItem.find("h3.r a");
        var url = link.attr("href");
        if (url && url.indexOf('/search?') !== 0) {
            var title = link.html();
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
                content: content
            });
        }
    }


    var hasExtrares = false, extrares = {};
    var exTitle = doc.find("#brs h3").html();
    if (exTitle) {
        var brs_cols, _brs_cols = [];
        hasExtrares = true;
        extrares.title = exTitle;
        brs_cols = doc.find("div.brs_col");

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
	console.timeEnd("gsearch_jquery");
    extrares.has = hasExtrares;
    
    this.result['extrares'] = extrares;
    this.result['resultStats'] = resultStats;
    this.result['data'] = arr;
};

gsearch.prototype.render = function (body) {
    this.parseResponse(body);
    this.callback(this.result);
};

/**
 * 发送查询请求
 **/
gsearch.prototype.request = function () {
    var self = this;
    if (!this.q) {
        this.callback([]);
        return;
    }
    this.checkMobile();
    var qs = {
        start: this.start,
        q: this.q,
        hl: this.config.lang//界面语言
    };
    
    if (this.lr) {//查询结果语言
        qs.lr = this.lr;
    }
    
    var headers = {
        'accept-language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
        'user-agent': this.userAgent,
        'referer': this.config.base_url
    };

    var options = {
        url: this.config.base_url+'/search',
        headers: headers,
        qs: qs
    };
//    console.log('open request...');
    request(options, function (err, res, body) {
        if (!err) {
            self.render(body);
        }
    });
};

module.exports = function (options,cb) {
    new gsearch(options,cb).request();
};