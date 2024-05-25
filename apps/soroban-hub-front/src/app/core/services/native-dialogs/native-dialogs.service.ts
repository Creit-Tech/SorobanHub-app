import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NativeDialogsService {
  constructor() {}

  async filePath(): Promise<string> {
    const result = await window.ipcAPI.invoke({
      route: 'utils/dialogs/file-path',
      msg: '',
    });

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.path;
  }
}
