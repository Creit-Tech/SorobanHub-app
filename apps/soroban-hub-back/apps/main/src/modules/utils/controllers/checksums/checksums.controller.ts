import { Controller, ValidationPipe } from '@nestjs/common';
import { IpcHandle } from '@doubleshot/nest-electron';
import { Payload } from '@nestjs/microservices';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';

@Controller('utils/checksums')
export class ChecksumsController {
  @IpcHandle('sha256')
  async sha256(
    @Payload(new ValidationPipe()) payload: any
  ): Promise<{ success: true; hash: string } | { success: false; message: string }> {
    if (!existsSync(payload.filePath)) {
      return { success: false, message: `File doesn't exist` };
    }

    let text: Buffer;
    try {
      text = readFileSync(payload.filePath);
    } catch (e) {
      return { success: false, message: e.message };
    }

    let hash: string;
    try {
      hash = createHash('sha256').update(text).digest().toString('hex');
    } catch (e) {
      return { success: false, message: e.message };
    }

    return { success: true, hash };
  }
}
