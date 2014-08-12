REPORTER=spec
ISTANBUL=./node_modules/.bin/istanbul
MOCHA=./node_modules/.bin/_mocha

test: hint mocha

test-coveralls: hint mocha coveralls

mocha:
	$(ISTANBUL) cover $(MOCHA) \
		--report lcovonly -- \
		--reporter $(REPORTER) \
		--bail \
		test/**/*-test.js test/*-test.js


hint:
	@./node_modules/.bin/jshint lib route config test tool model

coveralls:
	cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage

populate:
	node ./tool/populate

.PHONY: test test-watch
