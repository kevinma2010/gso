var express = require('express');
var gsearch = require('../lib/gsearch');
var router = express.Router();
var ejs = require('ejs')
    , fs = require('fs');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/search', function (req, res) {
    var q = req.query.q;
    var start = req.query.start || 0;
    var mobile = req.query.mobile || 0;
    var userAgent = req.headers['user-agent'];
//    console.log(userAgent);
    start = parseInt(start);
    mobile = parseInt(mobile);
    gsearch(q,start, userAgent,function (result) {
        if (mobile === 1) {
            var tmpl = fs.readFileSync(__dirname + '/../views/results.ejs', 'utf8');
            var html = ejs.render(tmpl, {result: result});
            res.end(html);
            return;
        }
//        console.log(result);

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

//        console.log(num);
        res.render('result', {
            title: q + ' - Google Search',
            result: result,
            page: page
        });
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

router.get('/test', function (req, res) {
   res.render
});

module.exports = router;
