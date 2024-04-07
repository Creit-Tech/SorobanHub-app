import { Injectable, Logger } from '@nestjs/common';
import { resolve as pathResolve } from 'node:path';
import { homedir } from 'node:os';
import { mkdirSync, readFileSync, unlinkSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

@Injectable()
export class SettingsService {
  logger: Logger = new Logger(SettingsService.name);
  folderPath: string = pathResolve(homedir(), '.SorobanHub');
  saltFilePath: string = pathResolve(this.folderPath, 'salt.txt');

  /**
   * The salt used to hash the password before using it to encrypt data
   * If the salt doesn't exist
   * This value doesn't need to be protected
   */
  private _salt: string;
  get salt(): string {
    if (!!this._salt) {
      return this._salt;
    }

    if (existsSync(this.saltFilePath)) {
      this._salt = readFileSync(this.saltFilePath, 'utf-8');
    } else {
      this.logger.debug("Salt doesn't exist, salt just created");
      this._salt = randomBytes(256).toString('hex');
      writeFileSync(this.saltFilePath, this._salt, 'utf-8');
    }

    return this._salt;
  }

  confirmAndCreateFolder(): void {
    if (!existsSync(this.folderPath)) {
      this.logger.debug("Settings folder doesn't exist, folder created.");
      mkdirSync(this.folderPath, { recursive: true });
    }
  }

  saveSetting(params: { fileName: SettingFile; folder?: string; data: string }): void {
    const targetFolder: string = pathResolve(this.folderPath, params.folder || '');

    if (!existsSync(targetFolder)) {
      mkdirSync(targetFolder, { recursive: true });
    }

    const filePath: string = pathResolve(targetFolder, `${params.fileName}.json`);
    writeFileSync(filePath, params.data, 'utf-8');
  }

  readSetting(params: { fileName: SettingFile; folder?: string }): string {
    const filePath: string = pathResolve(this.folderPath, params.folder || '', `${params.fileName}.json`);
    return readFileSync(filePath, 'utf-8');
  }

  removeSetting(params: { fileName: SettingFile; folder?: string }) {
    const filePath: string = pathResolve(this.folderPath, params.folder || '', `${params.fileName}.json`);
    unlinkSync(filePath);
  }
}

export enum SettingFile {
  /**
   * The general file keeps information
   */
  GENERAL = 'general',

  ONBOARDING = 'onboarding',
  NETWORKS = 'networks',
  IDENTITIES = 'identities',
}

export enum SettingFolder {
  /**
   * This folder is used to keep files where we keep the front end view state (elf state)
   */
  STATE = 'state',
}
