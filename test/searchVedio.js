var request = require("request");
var $ = require('jQuery');

var options = {
	url: "http://www.soku.com/v?keyword=初恋这件小事"
};

request(options, function (err, res, body) {
	if (!err && res.statusCode==200) {
		 // console.log(body);
		var doc = $(body);
		var sources_html = doc.find("div.source.source_one").html();
		var sources = doc.find("div.source.source_one span a");
		if (sources) {
			console.log(sources.length);
			for(var i = 0, total = sources.length; i < total; i++) {
				var link = $(sources[i]);
				console.log(link.html());
				console.log(link.attr("title"));
				console.log(link.attr("href"));
			}
		}
	 	console.log(sources_html);
	}
});