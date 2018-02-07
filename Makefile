install: install-deps install-flow-typed

start:
	npm run dev-server -- --env production

dev:
	rm -rf dist
	npm run dev-server -- --env development

install-deps:
	npm install

install-flow-typed:
	npm run flow-typed install

check-types:
	npm run flow -- stop && npm run flow

lint:
	npm run eslint -- .

test:
	npm run test

publish:
	npm publish

.PHONY: test
