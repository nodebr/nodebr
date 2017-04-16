module.exports = (function() {
	var feed = null;
	var feedItems = null;
	
	function addItems(items) {
		feedItems = [];
		items = items instanceof Array ? items : [items];
		items.forEach(function(item) {
			feedItems.push(translate(item));
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
		var RSS = require('rss');

		var options = {
			title: 'NodeBR News',
			description: 'Noticias relacionadas a comunidade node.js brasileira'
		};

		feed = new RSS(options);
		feedItems.forEach(function(item) {
			feed.item(item);
		});
		return feed.xml();
	}

	return {
		addItems: addItems,
		getRSS: getRSS
	};
})();
