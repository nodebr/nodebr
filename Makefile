REPORTER=spec
ISTANBUL=./node_modules/.bin/istanbul
MOCHA=./node_modules/.bin/_mocha

test: hint mocha 

mocha:
	$(ISTANBUL) cover $(MOCHA) \
		--report lcovonly -- \
		--reporter $(REPORTER) \
		--bail \
		test/*.js

hint:
	@./node_modules/.bin/jshint lib route config test

.PHONY: test test-watch
