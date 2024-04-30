build-front:
	pnpm --filter soroban-hub-front build

build-front-watch:
	pnpm --filter soroban-hub-front watch

build-back:
	pnpm --filter soroban-hub-back build

build-back-watch:
	pnpm --filter soroban-hub-back build:watch

copy-files:
	mkdir -p apps/soroban-hub/src/renderer/
	cp -r apps/soroban-hub-front/dist/soroban-hub-front/browser/* apps/soroban-hub/src/renderer/
	mkdir -p apps/soroban-hub/src/main/
	cp apps/soroban-hub-back/dist/apps/main/main.js apps/soroban-hub/src/main/index.js
