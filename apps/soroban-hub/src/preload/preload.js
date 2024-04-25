// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipcAPI', {
  invoke: ({ route, msg }) => ipcRenderer.invoke(route, msg),
  send: ({ route, msg }) => ipcRenderer.send(route, msg),
  on: ({ channel, callback }) => {
    ipcRenderer.on(channel, (_event, value) => callback(value));
  },
});
