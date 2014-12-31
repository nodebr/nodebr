var rss = require(__dirname + '/../lib/rss');
var assert = require('assert');


describe('Biblioteca de geracao de RSS', function() {

	it('Deve inserir itens', function() {
		rss.addItems({
			title: 'Configurando o package.json',
			link: 'http://domain.com',
			description: 'Como configurar o package.json e entendendo os seus simbolos',
			user: {name: 'Highlander'},
			created: new Date(2014, 04, 21, 12, 11, 0)
		});

		var xmlItem = 
		'<item>' +
	        '<title><![CDATA[Configurando o package.json]]></title>' +
	        '<description><![CDATA[Como configurar o package.json e ' +
	        'entendendo os seus simbolos]]></description>' +
	        '<link>http://domain.com</link>' +
	        '<guid isPermaLink="true">http://domain.com</guid>' +
	        '<dc:creator><![CDATA[Highlander]]></dc:creator>' +
	        '<pubDate>Wed, 21 May 2014 15:11:00 GMT</pubDate>' +
	    '</item>';

		assert.ok(rss.getRSS().replace(/(\r\n|\n|\r)/gm,'').indexOf(xmlItem) > -1);

		rss.addItems({
			title: 'Performance em nodejs',
			link: 'http://domain.com',
			description: 'Dicas para melhorar a performance de suas apps',
			user: {name: 'Peter Parker'},
			created: new Date(2014, 01, 15, 12, 11, 0)
		});

		xmlItem = '<item>' +
	        '<title><![CDATA[Performance em nodejs]]></title>' +
	        '<description><![CDATA[Dicas para melhorar a performance ' +
	        'de suas apps]]></description>' +
	        '<link>http://domain.com</link>' +
	        '<guid isPermaLink="true">http://domain.com</guid>' +
	        '<dc:creator><![CDATA[Peter Parker]]></dc:creator>' +
	        '<pubDate>Sat, 15 Feb 2014 14:11:00 GMT</pubDate>' +
	    '</item>';

		assert.ok(rss.getRSS().replace(/(\r\n|\n|\r)/gm,'').indexOf(xmlItem) > -1);
	});
});
