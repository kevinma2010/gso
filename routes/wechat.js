var config = require('../conf/config'),
	gsearch = require('../lib/gsearch');

function wechat  (req, res, next) {
 	var message = req.weixin;
 	console.log(message);
 	var q = "";
 	if (message.MsgType === 'text') {
		q = message.Content;
	}else if (message.MsgType === 'voice') {
		 var recognition = message.Recognition;
		 if (recognition) {
		 	q = recognition;
		 } else {
		 	res.reply("未成功识别出语音");
		 	return;
		 }
	} else {
		res.reply("输入关键词再搜啦~");
		return;
	}

	if (q === "") {
		res.reply('输入关键词再搜啦');
		return;
	}

	gsearch({
	    q: q,
	    userAgent: config.userAgent
	},function (err, data) {
	    if (err || !data) {
	        console.log(err);
	        res.reply("服务器开小差了....")
	        return;
	    }
	    var results = data['data'], arr = [];
	    if (results.length <= 0) {
	    	res.reply("未查询到相关结果");
	    	return;
	    }
	    for (var i = 0; i < results.length; i++) {
	    	var item = results[i];
	    	arr.push({
	    		title: item.title,
	    		url: item.url,
	    		description: item.content,
	    		picUrl : "http://weizhifeng.net/images/tech/composer.png"
	    	});
	    };
	    res.reply(arr);
	    return;
	});
}

module.exports = wechat;