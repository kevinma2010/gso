var express = require('express');
var path = require('path');
// var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var minify = require('html-minifier').minify;

var routes = require('./routes/index');

var config = require('./conf/config');

var app = express();
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    res.setHeader('X-Powered-By', 'Longbo Ma');
    res.setHeader('Donate-Me', 'mlongbo@gmail.com (This is a alipay account)');
    res.setHeader('HomePage', 'http://mlongbo.com');
    res.setHeader('GitHub', 'https://github.com/lenbo-ma')

    var encrypted = (req.protocol || 'http')==='https';
    app.locals['constant'] = {
        encrypted: encrypted,
        autocomplate_url: encrypted ? config.ssl.autocomplate_url : config.autocomplate_url,
        r_prefix: encrypted ? config.ssl.r_prefix : config.r_prefix
    };
    next();
});

if (app.get('env') === 'production') {
    // html minify
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

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    res.status(404);
    var url = req.url;
    res.render('404', {
        url : url
    });
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.error(err.message);
        res.render('500', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('500', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
