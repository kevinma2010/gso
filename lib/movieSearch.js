/**
 * @author Longbo Ma
 */
var request = require('request');
var zlib = require('zlib');
var $ = require('jQuery');

var movie = function (options, cb) {
  this.q = options.q;
};

movie.searchSources = function () {
  request({
    url: "http://www.soku.com/v?keyword="+this.q,
    encoding: null
  },function (err, res, body) {
      if (!err && res.statusCode==200) {
          var res_encoding  = res.headers['content-encoding'];
          if (res_encoding && res_encoding.indexOf("gzip")  >= 0) {
              zlib.unzip(body, function(err, buffer) {
                  body =  buffer.toString();
              });
          } else {
          }
      }
  });
};

module.exports = function (options, cb) {
  
};