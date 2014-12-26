
var words,
	split,
	platform,
	data,
	fs = require('fs'),
	os = require('os'),
	path = require('path');

data = fs.readFileSync(path.join(__dirname, '../conf/words.txt'), {encoding: 'utf8'});
platform = os.platform();
if (platform === 'win32' || platform === 'win64') {
	split = '\r\n\r\n';
} else {
	split = '\n\n';
}
words = data.split(split);
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
