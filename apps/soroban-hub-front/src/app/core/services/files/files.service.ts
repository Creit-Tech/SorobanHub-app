import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor() { }

  async fileData(filePath: string): Promise<Buffer> {
    const result = await window.ipcAPI.invoke({
      route: 'utils/files/file-data',
      msg: { filePath },
    });

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  }
}
