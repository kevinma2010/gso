var cheerio = require('cheerio');

var $ = cheerio.load('<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">'+
'<TITLE>302 Moved</TITLE></HEAD><BODY>'+
'<H1>302 Moved</H1>'+
'The document has moved'+
'<A HREF="http://ipv4.google.com/sorry/IndexRedirect?continue=http://173.194.38.200/search%3Fq%3Dnginx&amp;q=CGMSBGq6eV0YhJvZpAUiGQDxp4NLNFLldZ5wa9Hjh_3FJr51m04xNaY">here</A>.'+
'</BODY></HTML>');

console.log($('div.hdtb_imb').length);