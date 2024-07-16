const path = require('node:path');
const fs = require('node:fs');

const viewDistFolder = path.resolve(__dirname, 'apps/soroban-hub-front/dist/soroban-hub-front/browser');
const rendererFolder = path.resolve(__dirname, 'apps/soroban-hub/src/renderer');
const backDistFolder = path.resolve(__dirname, 'apps/soroban-hub-back/dist/apps/main/main.js');
const mainFolder = path.resolve(__dirname, 'apps/soroban-hub/src/main');

// We make sure the folders exist and if they don't we create them
if (!fs.existsSync(rendererFolder)) {
  fs.mkdirSync(rendererFolder, { recursive: true });
}

if (!fs.existsSync(mainFolder)) {
  fs.mkdirSync(mainFolder, { recursive: true });
}

fs.cpSync(viewDistFolder, rendererFolder, { recursive: true });
fs.cpSync(backDistFolder, path.resolve(mainFolder, 'index.js'));

console.log('Files copied.')
