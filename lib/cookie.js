
var cookieUtil = require('cookie');

module.exports = {
	/**
	* 解析google返回的cookie
	**/
	parseGoogleCookies: function (cookies) {
		// console.log(cookies);
	    var cookieArr = [];
	    if (cookies && cookies.length > 0) {
	        for (var i = 0; i < cookies.length; i++) {
	            var cookieItem = cookieUtil.parse(cookies[i]);
	            if (cookieItem.domain) {
	                delete cookieItem.domain;
	            }
	            if (cookieItem.path) {
	                cookieItem.path = '/';
	            }
	            var tempArr = [];
	            for (var key in cookieItem) {
	            	if (key === 'expires' || key === 'path') {
		                tempArr.push(key+'='+cookieItem[key]);
	            	} else {
		                tempArr.push("google_"+key+'='+cookieItem[key]);
	            	}
	            }
	            cookieArr.push(tempArr.join('; '));
	        };
	        // console.log(cookieArr);
	    }
	    return cookieArr;
	},
	/**
	* 解析用户请求的cookie
	**/
	parseRequestCookies: function (cookies) {
		// console.log(cookies);
		var arr = [];
		for (var key in cookies) {
			var index = key.indexOf("google_");
			if (index != -1) {
				console.log(key.substring(index+7));
				arr.push(key.substring(index+7)+"="+cookies[key]);
			}
		}
		return arr.join("; ");
	}
};