var rss = require(__dirname + '/../lib/rss');
var assert = require('assert');

describe('Biblioteca de geracao de RSS', function() {

	it('Deve inserir um item', function() {
		rss.addItems({
			title: 'Configurando o package.json',
			link: 'http://domain.com',
			description: 'Como configurar o package.json e entendendo os seus simbolos',
			user: {name: 'Highlander'},
			created: new Date(2014, 04, 21, 12, 11, 0)
		});

		var xmlItem = '<item>' +
			            '<title><![CDATA[Configurando o package.json]]></title>' +
			            '<description><![CDATA[Como configurar o package.json e entendendo os seus simbolos]]></description>' +
			            '<link>http://domain.com</link>' +
			            '<guid isPermaLink="true">http://domain.com</guid>' +
			            '<dc:creator><![CDATA[Highlander]]></dc:creator>' +
			            '<pubDate>Wed, 21 May 2014 15:11:00 GMT</pubDate>' +
			        '</item>';

		assert.ok(rss.getRSS().replace(/(\r\n|\n|\r)/gm,'').indexOf(xmlItem) > -1);
	});
});
