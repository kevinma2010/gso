/**
 * @author Longbo Ma
 */
var request = require('request');
var zlib = require('zlib');
var $ = require('jQuery');

function parseBody (body) {
    var arr = [];
    var search = $(body).find("#search").find("li[class='g']");
    var resultStats = $(body).find("#resultStats").html();
    console.log(search.length);
    search.each(function () {
        var h3 = $(this).find("h3[class='r']");
        var link = h3.find('a');
        var url = link.attr("href");
        if (url && url.indexOf('/search?') != 0) {
            url = url.substring('7');
            var title = link.html();
            var content = $(this).find("span[class='st']").text();
            var cite = $(this).find("cite").html();
            // content = iconv.decode(content, 'utf8');
            console.log("title:  " + title);
            console.log("url: " + url);
            console.log("content: " + content);
            console.log("cite: " + cite);
            console.log("\n\n");

            arr.push({
                title: title,
                url: url,
                cite: cite,
                content: content
            });
        }
    });
    return {
        resultStats: resultStats,
        data: arr
    };
}

module.exports = function (q,start,userAgent,cb) {
    var start = start || 0;
    userAgent = userAgent || 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36';
    console.log("q: \t" + q + "\tstart:\t"+start);
    if (!q) {
        cb([]);
        return;
    }
    var base_url = 'https://www.google.com';
    var req_uri = base_url + '/search?q='+q+'&hl=zh-CN&start='+start;
    var options = {
        url: req_uri,
        encoding: null,
        headers : {
            'connection': 'keep-alive',
            'accept-encoding': 'gzip,deflate,sdch',
            'accept-language': 'zh-CN,zh;q=0.8,zh-TW;q=0.6',
            'user-agent': userAgent,
            'referer': base_url
        }
    };
    request(options, function  (err,resp,body) {
        if (!err && resp.statusCode==200) {
            // console.log(body);
            var res_encoding  = resp.headers['content-encoding'];
            console.log("res encoding: \t" + res_encoding);
            if (res_encoding.indexOf("gzip")  >= 0) {
                zlib.unzip(body, function(err, buffer) {
                    // console.log(buffer.toString())
                    body =  buffer.toString();
                    var result = parseBody(body);
                    result.q = q;
                    result.start = start;
                    cb(result);
                    return;
                });
            } else {
                var result = parseBody(body);
                result.q = q;
                result.start = start;
                cb(result);
                return;
            }
        }
    });
};