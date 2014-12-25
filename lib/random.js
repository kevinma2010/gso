
var words,
	fs = require('fs'),
	path = require('path');

var data = fs.readFileSync(path.join(__dirname, '../conf/words.txt'), {encoding: 'utf8'});
words = data.split('\n\n');
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
