import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'node:crypto';

@Injectable()
export class EncryptionService {
  logger: Logger = new Logger(EncryptionService.name);

  ALGO: string = 'aes-256-cbc';

  isEncryptionKeyAvailable: () => boolean;
  setEncryptionKey: (value: string) => void;
  encryptMessage: (params: EncryptParams) => EncryptResponse;
  decryptMessage: (params: EncryptResponse) => string;

  constructor() {
    let key: string;
    this.isEncryptionKeyAvailable = () => !!key;

    this.setEncryptionKey = (value: string): void => {
      this.logger.debug(`Saved key: ${value}`);
      key = value;
    };

    this.encryptMessage = (params: EncryptParams): EncryptResponse => {
      if (!key) {
        throw new Error('Encryption key has not been set');
      }

      const iv: Buffer = randomBytes(16);
      const cipher = createCipheriv(this.ALGO, Buffer.from(key, 'base64'), iv);
      let encrypted: Buffer = cipher.update(params.message);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      return { encrypted: encrypted.toString('base64'), iv: iv.toString('base64') };
    };

    this.decryptMessage = (params: EncryptResponse): string => {
      if (!key) {
        throw new Error('Encryption key has not been set');
      }

      const decipher = createDecipheriv(this.ALGO, Buffer.from(key, 'base64'), Buffer.from(params.iv, 'base64'));
      const decrypted: Buffer = decipher.update(Buffer.from(params.encrypted, 'base64'));
      return Buffer.concat([decrypted, decipher.final()]).toString('utf-8');
    };
  }

  hashText(text: string, salt: string): string {
    return scryptSync(text, salt, 32).toString('base64');
  }
}

export interface EncryptParams {
  message: string;
}

// All text is in base64 format
export interface EncryptResponse {
  encrypted: string;
  iv: string;
}
