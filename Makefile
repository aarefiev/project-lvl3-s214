install: install-deps install-flow-typed

start:
	npm run webpack-dev-server -- --env development

install-deps:
	npm install

install-flow-typed:
	npm run flow-typed install

build:
	rm -rf dist
	npm run webpack -- -p --env production

check-types:
	npm run flow

lint:
	npm run eslint -- src test

publish:
	npm publish

.PHONY: test
