var express = require('express');
var gsearch = require('../lib/gsearch');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/search', function (req, res) {
    var q = req.query.q;
    gsearch(q,0, function (arr) {
        res.setHeader('content-type','application/json; charset=UTF-8');//响应编码，如果是html,写在head中也可以
        res.json(arr);
    });
});

router.get('/result', function (req, res) {

    res.render('result', {
        title: "aa"
    });
});
module.exports = router;
