module.exports = (function() {
	var RSS = require('rss');

	var options = {
		title: 'NodeBR News',
		description: 'Noticias relacionadas a comunidade node.js brasileira'
	};

	var feed = new RSS(options);

	function addItems(items) {
		items = items instanceof Array ? items : [items];
		items.forEach(function(item) {
			feed.item(translate(item));
		});
	}

	function translate(model) {
		return {
			title: model.title,
			description: model.description,
			date: model.created,
			url: model.link,
			author: model.user.name
		};
	}

	function getRSS() {
		return feed.xml();
	}

	return {
		addItems: addItems,
		getRSS: getRSS
	};
})();
