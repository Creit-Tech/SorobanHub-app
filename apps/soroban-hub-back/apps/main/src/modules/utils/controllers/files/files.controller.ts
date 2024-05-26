import { Controller, ValidationPipe } from '@nestjs/common';
import { IpcHandle } from '@doubleshot/nest-electron';
import { Payload } from '@nestjs/microservices';
import { existsSync, readFileSync } from 'node:fs';

@Controller('utils/files')
export class FilesController {
  @IpcHandle('file-data')
  async fileData(
    @Payload(new ValidationPipe()) payload: { filePath: string }
  ): Promise<{ success: true; data: Buffer } | { success: false; message: string }> {
    if (!existsSync(payload.filePath)) {
      return { success: false, message: `File doesn't exist` };
    }

    let data: Buffer;
    try {
      data = readFileSync(payload.filePath);
    } catch (e) {
      return { success: false, message: e.message };
    }

    return {
      success: true,
      data,
    };
  }
}
