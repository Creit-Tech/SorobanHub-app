export interface IpcAPI {
  invoke: (params: { route: string; msg: any }) => Promise<any>;
  send: (params: { route: string; msg: any }) => any;
}

declare global {
  interface Window {
    ipcAPI: IpcAPI;
  }
}
