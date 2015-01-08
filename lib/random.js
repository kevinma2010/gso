
var words,
	data,
	utils = require('./utils'),
	fs = require('fs'),
	os = require('os'),
	path = require('path');

data = fs.readFileSync(path.join(__dirname, '../conf/words.txt'), {encoding: 'utf8'});
var linefeed = utils.linefeed();
words = data.split(linefeed + linefeed);
// console.log(words);
// console.log();

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
