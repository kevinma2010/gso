
var gsearch_jquery = require('./gsearch_jquery');

console.time("gsearch_jquery");
gsearch_jquery({q: 'java'}, function (result) {
	
	console.timeEnd("gsearch_jquery");
	console.log(result.data.length);
});

var gsearch_cheerio = require('./gsearch_cheerio');

console.time("gsearch_cheerio");
gsearch_cheerio({q: 'java'}, function (result) {
	
	console.timeEnd("gsearch_cheerio");
	console.log(result.data.length);
});