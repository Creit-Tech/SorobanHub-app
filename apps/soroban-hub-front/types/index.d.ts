export interface IpcAPI {
  invoke: (params: { route: string; msg: any }) => Promise<any>;
  send: (params: { route: string; msg: any }) => any;
  on: (params: { channel: string; callback: (params: { type: string; data?: any }) => void }) => void;
}

declare global {
  interface Window {
    ipcAPI: IpcAPI;
  }
}
