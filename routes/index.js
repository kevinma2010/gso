var express = require('express');
var gsearch = require('../lib/gsearch');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/search', function (req, res) {
    var q = req.query.q;
    var userAgent = req.headers['user-agent'];
    console.log(userAgent);
    gsearch(q,0, userAgent,function (result) {
        res.render('result', {
            title: q + ' - Google Search',
            result: result
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

router.get('/result', function (req, res) {

    res.render('result', {
        title: "aa"
    });
});
module.exports = router;
