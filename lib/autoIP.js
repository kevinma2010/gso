
var arr = ['58.123.102.99','173.194.121.28','209.116.186.219'];

module.exports = {
	get: function () {
		return arr[Math.floor(Math.random()*arr.length)];
	}
};