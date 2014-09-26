var express = require('express');
var minify = require('html-minifier').minify;
var gsearch = require('../lib/gsearch');
var router = express.Router();
var ejs = require('ejs')
    , fs = require('fs')
    ,config = require('../config');

/* GET home page. */
router.get('/', function(req, res) {
    render(res,'index', { title: 'Google Search', r_prefix: config.r_prefix});  // res.render('index', { title: 'Google Search' });
});

router.get('/refactor', function(req, res) {
    render(res,'/test/style_refactor', { title: 'Google Search', r_prefix: config.r_prefix});  // res.render('index', { title: 'Google Search' });
});

/* GET Feedback page. */
router.get('/feedback', function(req, res) {
    render(res,'feedback', { r_prefix: config.r_prefix}); // res.render('index', { title: 'Google Search' });
});

/* GET Feedback page. */
router.get('/issues', function(req, res) {
    render(res,'issues', { r_prefix: config.r_prefix});
});

/* GET 404 page */
router.get('/notfound', function (req, res) {
    render(res,'404',{});
});

/* GET 500 page */
router.get('/error', function (req, res) {
    render(res,'500',{});
});

/* GET sensitive word page. */
router.get('/warn', function(req, res) {
    render(res,'sensitivity', { title: 'Google Search', r_prefix: config.r_prefix}); // res.render('sensitivity', { title: 'Google Search' });
});

router.get('/url', function (req,res,next) {
    var url = req.query.to;
    if (!url) {
        next();
        return;
    }

    res.redirect(url);
});

router.get('/search', function (req, res, next) {
    var q = req.query.q;
    var start = req.query.start || 0;
    var mobile = req.query.mobile || 0;
    var userAgent = req.headers['user-agent'];
    if (!q) {
        res.redirect("/");
        return;
    }
    q = decodeURI(q);
    start = parseInt(start);
    mobile = parseInt(mobile);
    gsearch({
        q: q,
        start: start,
        userAgent: userAgent
    },function (data) {
        console.log("searched: " + data['data'].length);
        if (mobile === 1) {
            render(res,"result_list", {result: data});
            return;
        }

        var completed = 0, 
        tasks = [],
        result = {},
        path_prefix = __dirname + '/../views/partials/';

        result.qs = {
            q: data['q'],
            start: data['start'],
            encodeQ: data['encodeQ']
        };

        result.state = {
            isMobile: data.mobile,
            hasResult: data['data'].length>0
        };

        var partials = {
            content: {},
            footer: {},
            extrares: {},
            pagination: {}
        };

        /*
        分页
         */
         if (!data.mobile) {
            var i = start/10+1;

            var num = [];
            var s,end,index = 0;
            if (i-5 <= 0) {
                s = 0;
                end = 10;
            } else {
                s = i-6;
                end=s+10;
            }

            for (var j = s, total = end; j < total; j++) {
                num[index++] = j*10;
            }

            var page = {
                pre: start-10,
                num: num,
                next: start+10,
                start: s,
                end: end
            };

            partials.pagination = {
                isRender: true,
                page: page
            };
        }

        /*
        相关搜索
         */
        if (!data.mobile && data.extrares.has) {
            partials.extrares = {
                isRender: true,
                title: data.extrares.title,
                list: data.extrares.arr
            };
        }
        /*
        底部
         */
        if (!data.mobile) {
            partials.footer = {
                isRender: true
            };
        }

        partials.content = {
            isRender: true,
            list: data['data'],
            resultStats: data.resultStats
        };

        for (var key in partials) {
            (function (_key) {
                tasks.push(function () {
                    fs.readFile(path_prefix+_key+'.ejs', 'utf8', function (err, tmpl) {
                        if (err) {
                           renderErr(_key);
                        } else {
                            var renderData = partials[_key];
                            if (renderData.isRender) {
                                renderData.qs = result.qs;
                                renderData.state = result.state;
                                result[_key] = ejs.render(tmpl, renderData);
                            } else {
                                result[_key] = "";
                            }
                            console.log(_key);
                            if (++completed >= tasks.length) {
                                render(res,'partials/result',result);
                            }
                        }
                    });
                });
            })(key);
        }

        for (var i = 0; i < tasks.length; i++) {
            tasks[i]();
        };

    });
});

function render (res,view,data) {
    console.log(view);
    data.r_prefix = config.r_prefix;
    fs.readFile(__dirname + '/../views/'+view+'.ejs', 'utf8', function (err,tmpl) {
        if (err) {
           renderErr(view);
        } else {
            var html = ejs.render(tmpl, data);
            html = minify(html,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
            res.set('Content-Type','text/html; charset=utf-8');
            res.end(html);
            res.flush();
        }
    }); 
}

function renderErr (res, viewName) {
    console.error("read "+viewName+".ejs failed......")
    res.status(500);
    res.render('500');
}

module.exports = router;
