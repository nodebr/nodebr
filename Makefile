REPORTER=spec

test: hint mocha

mocha:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--bail \
		test/*.js

hint:
	@./node_modules/.bin/jshint lib route config test

.PHONY: test test-watch
