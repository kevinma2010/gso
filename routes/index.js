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

router.get('/search', function (req, res) {
    var q = req.query.q;
    var start = req.query.start || 0;
    var mobile = req.query.mobile || 0;
    var userAgent = req.headers['user-agent'];
    if (!q) {
        res.redirect("/");
        return;
    }
    // console.log(q);
    q = decodeURI(q);
    // console.log(decodeURIComponent(q));
//    console.log(userAgent);
    start = parseInt(start);
    mobile = parseInt(mobile);
    gsearch({
        q: q,
        start: start,
        userAgent: userAgent
    },function (result) {
        if (mobile === 1) {
            render(res,"result_list", {result: result});
            return;
        }
//        console.log(result);
        var renderResult = {
            title: q,
            result: result
        };

        if (!result.mobile) {
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

            renderResult.page = page;
        }

        renderResult.r_prefix = config.r_prefix;   
        render(res,'result',renderResult); // res.render('result', renderResult);
    });
});

router.get('/url', function (req,res,next) {
    var url = req.query.to;
    if (!url) {
        next();
        return;
    }

    res.redirect(url);
});

function render (res,view,data) {
    fs.readFile(__dirname + '/../views/'+view+'.ejs', 'utf8', function (err,tmpl) {
        if (err) {
            console.error("read "+view+".ejs failed......")
            res.status(500);
            res.render('500');
        } else {
            var html = ejs.render(tmpl, data);
            html = minify(html,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
            res.set('Content-Type','text/html; charset=utf-8');
            res.end(html);
            res.flush();
        }
    }); 
}

module.exports = router;
