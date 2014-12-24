var express = require('express');
var minify = require('html-minifier').minify;
var gsearch = require('../lib/gsearch');
var mobile = require('../lib/mobile');
var random = require('../lib/random');
var router = express.Router();
var ejs = require('ejs')
    , fs = require('fs')
    ,config = require('../config');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        word: random.getWord()
    });
});

router.get('/refactor', function(req, res) {
    render(res,'/test/style_refactor', {});  // res.render('index', { title: 'Google Search' });
});

/* GET 500 page */
router.get('/error', function (req, res) {
    res.render('500', {});
});

/* GET sensitive word page. */
router.get('/warn', function(req, res) {
    res.render('sensitivity', {});
});

router.get('/url', function (req,res,next) {
    var url = req.query.to || req.query.q;
    if (!url) {
        next();
        return;
    }

    res.redirect(url);
});

router.get('/search', function (req, res, next) {
    var q = req.query.q;
    var start = req.query.start || 0;
    var lr = req.query.lr || '';
    var qdr = req.query.qdr || 0;
    qdr = isNaN(qdr) ? 0 : parseInt(qdr);
    var userAgent = req.headers['user-agent'];
    var cookies = req.cookies;
    var encrypted = (req.protocol || 'http')==='https';
    if (!q) {
        res.redirect("/");
        return;
    }
    q = decodeURI(q);
    start = parseInt(start);
    gsearch({
        q: q,
        start: start,
        lr: lr,
        tbs: qdr,
        userAgent: userAgent,
        cookies: cookies
    },function (data) {
        var result = {};
        result.qs = {//用户查询参数
            q: q,
            start: start,
            lr: lr,
            qdr: qdr,
            encodeQ: encodeURI(q)//url编码后的查询关键词
        };
        result.constants = require('../lib/constant');
        //设置cookie
        if (data.cookies && data.cookies.length > 0) {
            res.set('Set-Cookie', data.cookies);
        }
        res.set('Content-Type','text/html; charset=utf-8');

        //如果没有查询结果，则响应无结果提示界面
        if (data['data'].length <= 0) {
            result.qs.noneQ = result.qs.q.substring(0,100)+"...";
            res.render("none", result);
            return;
        }
        //计算分页
         result['page'] = pagination(start);

        //相关搜索
        result.extrares = data.extrares;
        //结果数组
        result.list = data['data'];
        //搜索用时文字
        result.resultStats = data.resultStats;
        res.render("result", result);
    });
});

/**
 * 计算分页
 * @param  {[type]} start [description]
 * @return {[type]}       [description]
 */
function pagination (start) {
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

        return page;
}
function render (res,view,data) {
    // console.log(view);
    data.r_prefix = data.encrypted? config.ssl.r_prefix : config.r_prefix;
    fs.readFile(__dirname + '/../views/'+view+'.ejs', 'utf8', function (err,tmpl) {
        if (err) {
           renderErr(view);
        } else {
            var html = ejs.render(tmpl, data);
            html = minify(html,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
            if (data.cookies && data.cookies.length > 0) {
                res.set('Set-Cookie', data.cookies);
            }
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
