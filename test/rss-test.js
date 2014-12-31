var rss = require(__dirname + '/../lib/rss');
var assert = require('assert');

describe('Biblioteca de geracao de RSS', function() {
	var description = 'Como configurar o package.json e ' +
		'entendendo os seus simbolos';

	it('Deve inserir itens', function() {
		rss.addItems({
			title: 'Configurando o package.json',
			link: 'http://domain.com',
			description: description,
			user: {name: 'Highlander'},
			created: new Date(2014, 04, 21, 12, 11, 0)
		});

		var xmlItem = []; 
		xmlItem.push('<item>');
	    xmlItem.push('<title><![CDATA[Configurando o package.json]]></title>');
	    xmlItem.push('<description><![CDATA[Como configurar o package.json e ');
		xmlItem.push('entendendo os seus simbolos]]></description>');
	    xmlItem.push('<link>http://domain.com</link>');
	    xmlItem.push('<guid isPermaLink="true">http://domain.com</guid>');
	    xmlItem.push('<dc:creator><![CDATA[Highlander]]></dc:creator>');
	    xmlItem.push('<pubDate>Wed, 21 May 2014 15:11:00 GMT</pubDate>');
	    xmlItem.push('</item>');

	    var xmlRss = rss.getRSS();
		assert.ok(xmlRss.indexOf(xmlItem.join('')) > -1);

		rss.addItems({
			title: 'Performance em nodejs',
			link: 'http://domain.com',
			description: 'Dicas para melhorar a performance de suas apps',
			user: {name: 'Peter Parker'},
			created: new Date(2014, 01, 15, 12, 11, 0)
		});

		xmlItem = [];
		xmlItem.push('<item>');
	    xmlItem.push('<title><![CDATA[Performance em nodejs]]></title>');
	    xmlItem.push('<description><![CDATA[Dicas para melhorar a performance ');
	    xmlItem.push('de suas apps]]></description>');
	    xmlItem.push('<link>http://domain.com</link>');
	    xmlItem.push('<guid isPermaLink="true">http://domain.com</guid>'); 
	    xmlItem.push('<dc:creator><![CDATA[Peter Parker]]></dc:creator>');
	    xmlItem.push('<pubDate>Sat, 15 Feb 2014 14:11:00 GMT</pubDate>');
	    xmlItem.push('</item>');

	    xmlRss = rss.getRSS();
		assert.ok(xmlRss.indexOf(xmlItem.join('')) > -1);
	});
});
