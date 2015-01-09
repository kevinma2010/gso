
var words,
	utils = require('./utils'),
	fs = require('fs'),
	path = require('path');

(function() {
	var data,linefeed;
	data = fs.readFileSync(path.join(__dirname, '../conf/words.txt'), {encoding: 'utf8'});
	linefeed = utils.linefeed();
	words = data.split(linefeed + linefeed);
}).call(this);

module.exports = {
	getWord: function () {
		var randomNum = Math.floor(Math.random()*words.length) || 0;
		return words[randomNum];
	}
};
