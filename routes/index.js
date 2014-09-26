var express = require('express');
var minify = require('html-minifier').minify;
var gsearch = require('../lib/gsearch');
var router = express.Router();
var ejs = require('ejs')
    , fs = require('fs')
    ,config = require('../config');

/* GET home page. */
router.get('/', function(req, res) {
    render(res,'index', {});  // res.render('index', { title: 'Google Search' });
});

router.get('/refactor', function(req, res) {
    render(res,'/test/style_refactor', {});  // res.render('index', { title: 'Google Search' });
});

/* GET Feedback page. */
router.get('/feedback', function(req, res) {
    render(res,'feedback', {}); // res.render('index', { title: 'Google Search' });
});

/* GET Feedback page. */
router.get('/issues', function(req, res) {
    render(res,'issues', {});
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
    render(res,'sensitivity', {}); // res.render('sensitivity', { title: 'Google Search' });
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
        // console.log("searched: " + data['data'].length);
        if (mobile === 1) {
            render(res,"partials/list", {result: data});
            return;
        }

        var completed = 0, 
        tasks = [],
        result = {},
        path_prefix = __dirname + '/../views/partials/';

        result.locals = {
            r_prefix : config.r_prefix
        };

        result.qs = {//用户查询参数
            q: q,
            start: start,
            encodeQ: encodeURI(q)//url编码后的查询关键词
        };

        result.state = {//一些条件，用于页面中做判断
            isMobile: data.isMobile,//是否为移动端
            hasResult: data['data'].length>0//是否有搜索结果
        };

        var partials = {//views
            content: {},//搜索结果view
            footer: {},//底部view
            extrares: {},//相关搜索view
            pagination: {}//分页view
        };

        /*
        计算分页
         */
         if (!data.isMobile) {
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
                pre: start-10,//上一页
                num: num,
                next: start+10,//下一页
                start: s,
                end: end
            };

            partials.pagination['page'] = page;
        }

        partials.pagination['isRender'] = true;//表示要渲染分页view

        /*
        相关搜索
         */
        if (!data.isMobile && data.extrares.has) {
            partials.extrares = {
                isRender: true,//表示要渲染相关搜索view
                title: data.extrares.title,
                list: data.extrares.arr
            };
        }
        /*
        底部
         */
        if (!data.isMobile) {
            partials.footer = {
                isRender: true//表示要渲染底部view
            };
        }

        partials.content = {//搜索结果view
            isRender: true,
            list: data['data'],
            resultStats: data.resultStats//搜索用时文字
        };

        for (var key in partials) {//循环增加渲染任务
            (function (_key) {
                tasks.push(function () {
                    fs.readFile(path_prefix+_key+'.ejs', 'utf8', function (err, tmpl) {
                        if (err) {
                           renderErr(_key);//文件读取错误,500
                        } else {
                            var renderData = partials[_key];//渲染该段view需要使用的数据
                            if (renderData.isRender) {//判断是否要渲染
                                renderData.locals = result.locals;
                                renderData.qs = result.qs;
                                renderData.state = result.state;
                                result[_key] = ejs.render(tmpl, renderData);//将渲染结果增加到result中，便于所有任务完成后统一渲染页面
                            } else {
                                result[_key] = "";
                            }
                            // console.log(_key);
                            if (++completed >= tasks.length) {//判断所有渲染任务是否完成
                                render(res,'partials/result',result);
                            }
                        }
                    });
                });
            })(key);
        }

        for (var n = 0; n < tasks.length; n++) {//执行并行渲染任务
            tasks[n]();
        }

    });
});

function render (res,view,data) {
    // console.log(view);
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
    console.error("read "+viewName+".ejs failed......");
    res.status(500);
    res.render('500');
}

module.exports = router;
