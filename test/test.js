
var gsearch_jquery = require('./gsearch_jquery');

gsearch_jquery({q: 'java'}, function (result) {
	
	console.log(result.data.length);
});

var gsearch_cheerio = require('./gsearch_cheerio');

gsearch_cheerio({q: 'java'}, function (result) {
	
	console.log(result.data.length);
});