/**
 * @author Longbo Ma
 */
var request = require('request');
var zlib = require('zlib');
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
    this.result = {
        q: this.q,
        encodeQ: encodeURIComponent(this.q),
        start: this.start
    };
    // console.log(this.result);
    this.config = {
        base_url: config.g_url,
        lang: config.language
    };
};

gsearch.prototype.checkMobile = function () {
    var isMobile = this.isMobile = mobile.isMobile(this.userAgent);
    if (isMobile) {
        this.userAgent = config.userAgent;
    }
    this.result.mobile = isMobile;
};

gsearch.prototype.parseResponse = function (body) {
    var arr = [];
    var doc = $(body);
    var search = doc.find("#search").find("li.g");
    var resultStats = doc.find("#resultStats").html() || "";
//    console.log(search.length);
    for (var i = 0; i < search.length; i++) {
        var sItem = $(search[i]);
        var link = sItem.find("h3.r a");
        var url = link.attr("href");
        if (url && url.indexOf('/search?') != 0) {
            var title = link.html();
            var content = sItem.find("span.st").text();
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
    };


    var hasExtrares = false, extrares = {};
    var exTitle = doc.find("#brs h3").html();
    if (exTitle) {
        var brs_cols, _brs_cols = []
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
                _text = encodeURIComponent(_text);
                // console.log(_text);
                _col.push({
                    content: _html,
                    url: '/search?q='+_text
                });
            };
            _brs_cols.push(_col);
        };

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
    this.callback(this.result);
};

gsearch.prototype.request = function () {
    var self = this;
    if (!this.q) {
        cb([]);
        return;
    }
    this.checkMobile();
    var qs = {
        start: this.start,
        q: this.q,
        hl: this.config.lang
    };
    var headers = {
        'connection': 'keep-alive',
        'accept-encoding': 'gzip,deflate,sdch',
        'accept-language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
        'user-agent': this.userAgent,
        'referer': this.config.base_url
    };

    var options = {
        url: this.config.base_url+'/search',
        encoding: null,
        headers: headers,
        qs: qs
    };
//    console.log('open request...');
    request(options, function (err, res, body) {
        if (!err && res.statusCode==200) {
//            console.log('handle response....');
            var res_encoding  = res.headers['content-encoding'];
            if (res_encoding.indexOf("gzip")  >= 0) {
                zlib.unzip(body, function(err, buffer) {
                    body =  buffer.toString();
                    self.render(body);
                });
            } else {
                self.render(body);
            }
        }
    });
};

module.exports = function (options,cb) {
    new gsearch(options,cb).request();
};