
var words,
	fs = require('fs'),
	path = require('path');

var data = fs.readFileSync(path.join(__dirname, '../data/words.txt'), {encoding: 'utf8'});
words = data.split('\r\n\r\n');
// console.log(words);

function getRandom (arr) {
	var randomNum = Math.floor(Math.random()*arr.length) || 0;
	return arr[randomNum];
}
var random = {
	getWord: function () {
		return getRandom(words);
	}
};

module.exports = random;
