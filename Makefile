start-front:
	pnpm --filter soroban-hub-front start

build-back:
	pnpm --filter soroban-hub-back build

build-back-watch:
	pnpm --filter soroban-hub-back build:watch

launch-desktop:
	cp apps/soroban-hub-back/dist/apps/main/main.js apps/soroban-hub/src/main/index.js
	pnpm --filter soroban-hub start
