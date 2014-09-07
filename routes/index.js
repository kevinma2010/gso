var express = require('express');
var minify = require('html-minifier').minify;
var gsearch = require('../lib/gsearch');
var router = express.Router();
var ejs = require('ejs')
    , fs = require('fs')
    ,config = require('../config');

/* GET home page. */
router.get('/', function(req, res) {
    fs.readFile(__dirname + '/../views/index.ejs', 'utf8', function (err,tmpl) {
        if (err) {
            console.error("read index.ejs failed......")
            res.status(500);
            res.render('500');
        } else {
            var html = ejs.render(tmpl, { title: 'Google Search', r_prefix: config.r_prefix});
            html = minify(html,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
            res.end(html);
            res.flush();
        }
    });  // res.render('index', { title: 'Google Search' });
});

/* GET 404 page */
router.get('/notfound', function (req, res) {
    fs.readFile(__dirname + '/../views/404.ejs', 'utf8', function (err,tmpl) {
        if (err) {
            console.error("read 404.ejs failed......")
            res.status(500);
            res.render('500');
        } else {
            var html = ejs.render(tmpl, {});
            html = minify(html,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
            res.end(html);
            res.flush();
        }
    }); 
});

/* GET 500 page */
router.get('/error', function (req, res) {
    fs.readFile(__dirname + '/../views/500.ejs', 'utf8', function (err,tmpl) {
        if (err) {
            console.error("read 500.ejs failed......")
            res.status(500);
            res.render('500');
        } else {
            var html = ejs.render(tmpl, {});
            html = minify(html,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
            res.end(html);
            res.flush();
        }
    }); 
});

/* GET sensitive word page. */
router.get('/warn', function(req, res) {
    fs.readFile(__dirname + '/../views/sensitivity.ejs', 'utf8', function (err,tmpl) {
        if (err) {
            console.error("read sensitivity.ejs failed......")
            res.status(500);
            res.render('500');
        } else {
            var html = ejs.render(tmpl, { title: 'Google Search', r_prefix: config.r_prefix});
            html = minify(html,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
            res.end(html);
            res.flush();
        }
    });  // res.render('sensitivity', { title: 'Google Search' });
  });

router.get('/search', function (req, res) {
    var q = req.query.q;
    var start = req.query.start || 0;
    var mobile = req.query.mobile || 0;
    var userAgent = req.headers['user-agent'];
    if (!q) {
        res.redirect("/");
    }
//    console.log(userAgent);
    start = parseInt(start);
    mobile = parseInt(mobile);
    gsearch({
        q: q,
        start: start,
        userAgent: userAgent
    },function (result) {
        if (mobile === 1) {
            var tmpl = fs.readFileSync(__dirname + '/../views/result_list.ejs', 'utf8');
            var html = ejs.render(tmpl, {result: result});
            res.end(html);
            return;
        }
//        console.log(result);
        var renderResult = {
            title: q + ' - Google Search',
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

        fs.readFile(__dirname + '/../views/result.ejs', 'utf8', function (err,tmpl) {
            if (err) {
                console.error("read result.ejs failed......")
                res.status(500);
                res.render('500');
            } else {
                renderResult.r_prefix = config.r_prefix;
                var html = ejs.render(tmpl, renderResult);
                html = minify(html,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true});
                res.end(html);
                res.flush();
            }
        });  // res.render('result', renderResult);
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


module.exports = router;
