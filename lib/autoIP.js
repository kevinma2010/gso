
// var arr = ['58.123.102.99','173.194.121.28','209.116.186.219'];
// var arr = [
// 	'173.194.38.200',
// 	'173.194.38.127',
// 	'173.194.38.97',
// 	'173.194.38.111',
// 	'173.194.38.119',
// 	'173.194.38.114',
// 	'173.194.38.115',
// 	'173.194.38.112',
// 	'173.194.38.113',
// 	'173.194.38.80'
// 	];

var arr = require('../config').ipArray;

module.exports = {
	get: function () {
		var randomNum = Math.floor(Math.random()*arr.length) || 0;
		console.log("get ip: " + arr[randomNum]);
		return arr[randomNum];
	}
};
