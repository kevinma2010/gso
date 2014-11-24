var words = [
	'一念靜心 花開遍世界',
	'随你走在天际，看繁华满地。',
	'褪尽风华，我依然在彼岸守护你。',
	'那被岁月覆盖的花开，一切白驹过隙成为空白。',
	'“说，你除了吃还会什么？” “还会饿。” by 夏正正',
	'我一直以为最糟糕的情况是你离开我，其实最令我难过的，是你不快乐。from 《怪物旅社》'
];

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