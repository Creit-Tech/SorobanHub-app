import { StateStorage } from '@ngneat/elf-persist-state/src/lib/storage';

declare const window: {
  ipcAPI: {
    invoke: (params: { route: string; msg: any }) => Promise<any>;
    send: (params: { route: string; msg: any }) => any;
  };
};

export class StorageStrategy implements StateStorage {
  private readonly encrypt: boolean;
  constructor(params: { encrypt: boolean }) {
    this.encrypt = params.encrypt;
  }

  async setItem(key: string, value: Record<string, any>): Promise<void> {
    console.log('setItem', { key, value });
    await window.ipcAPI.invoke({
      route: 'settings/state/set-item',
      msg: { key, data: JSON.stringify(value), encrypt: this.encrypt },
    });
  }

  async getItem<T extends Record<string, any>>(key: string): Promise<T | null | undefined> {
    const { state } = await window.ipcAPI.invoke({
      route: 'settings/state/get-item',
      msg: { key, encrypt: this.encrypt },
    });
    console.log('getItem', { state });
    return state && JSON.parse(state);
  }

  removeItem(key: string): Promise<boolean | void> {
    return window.ipcAPI.invoke({
      route: 'settings/state/remove-item',
      msg: { key },
    });
  }
}
