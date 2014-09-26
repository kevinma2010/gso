
var gsearch = require('../lib/gsearch');

var start = new Date().getTime();
console.log(start);
gsearch({q: 'java'}, function (result) {
	var end = new Date().getTime();
	console.log(end-start);
	console.log(result.data.length);
});