var express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    colors = require( "colors");

var routes = require('./routes/index'),
    wechat = require('wechat'),
    wechatRouter = require('./routes/wechat'),
    config = require('./conf/config');

var minify;

var app = express();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// 访问日志记录,console打印
if (app.get('env') === 'development') {
    app.use(require('morgan')('dev'));
}

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//设置自定义响应头, 希望你留下这些作者说明
app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'Longbo Ma');
    res.setHeader('Donate-Me', 'mlongbo@gmail.com (This is a alipay account)');
    res.setHeader('HomePage', 'http://mlongbo.com');
    res.setHeader('GitHub', 'https://github.com/lenbo-ma')

    var encrypted = (req.protocol || 'http')==='https';
    app.locals['constant'] = {
        name: config.name || '谷搜客',
        encrypted: encrypted,
        autocomplate_url: encrypted ? config.ssl.autocomplate_url : config.autocomplate_url,
        r_prefix: encrypted ? config.ssl.r_prefix : config.r_prefix
    };
    next();
});

if (app.get('env') === 'production') {
    // html minify
    minify = require('html-minifier').minify;
    app.use(function (req, res, next) {
        res._render = res.render;

        res.render = function(view, options, fn){
            var self = this;
            var req = this.req;
            fn = fn || function(err, str){
                if (err) return req.next(err);
                self.send(minify(str,{removeComments: true,collapseWhitespace: true,minifyJS:true, minifyCSS:true}));
              };
            // render
            self._render(view, options, fn);
        };
        next();
    });
}

app.use('/', routes);
if (config.wechat.enable) {
    app.use('/wechat', wechat(config.wechat, function (req, res, next) {
        wechatRouter(req, res, next);
    }));
}

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404);
    var url = req.url;
    res.render('404', {
        url : url
    });
});

/// error handlers
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.error(err.message.red);
    console.error(err.stack);
    res.render('500', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
