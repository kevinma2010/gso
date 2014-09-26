
var request = require('request').defaults({ encoding: null }),
    zlib = require('zlib');
    
module.exports = function (options, callback) {
    options.headers = options.headers || {};
    options.headers['connection'] = 'keep-alive';
    options.headers['accept-encoding'] = 'gzip,deflate,sdch';
        
    request(options, function (err, res, body) {
        if (err) {
            callback(err);
        } else if (res.statusCode==200){
            var res_encoding  = res.headers['content-encoding'];
            if (res_encoding && res_encoding.indexOf("gzip")  >= 0) {
                // console.log("gzip");
                zlib.unzip(body, function(err, buffer) {
                  body =  buffer.toString();
                  callback(null, res, body);
                });
            } else {
                // console.log("ungzip");
                callback(null, res, body);      
            }
        }
    });
};