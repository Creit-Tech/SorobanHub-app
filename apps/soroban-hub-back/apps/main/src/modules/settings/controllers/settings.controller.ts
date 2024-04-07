import { BadRequestException, Controller, Logger, OnModuleInit, ValidationPipe } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { IpcHandle } from '@doubleshot/nest-electron';
import { EncryptionService, EncryptResponse } from '~library/encryption';
import { SettingFile, SettingFolder, SettingsService } from '../services/settings.service';
import { SetConfigPayloadDto } from './dtos/set-config.dto';
import { GetStatePayloadDto, RemoveStatePayloadDto, SetStatePayloadDto } from './dtos/set-state.dto';

@Controller('settings')
export class SettingsController implements OnModuleInit {
  logger: Logger = new Logger(SettingsController.name);

  constructor(
    private readonly encryptionService: EncryptionService,
    private readonly settingsService: SettingsService
  ) {}

  onModuleInit(): any {
    this.settingsService.confirmAndCreateFolder();
  }

  @IpcHandle('set-password')
  async setPassword(@Payload() password: string): Promise<{ success: true }> {
    if (!password) {
      new BadRequestException(['Password is mandatory']);
    }

    const hashedPassword: string = this.encryptionService.hashText(password, this.settingsService.salt);
    this.encryptionService.setEncryptionKey(hashedPassword);

    const fileText: string = this.settingsService.readSetting({ fileName: SettingFile.GENERAL });
    const encryptedData: EncryptResponse = JSON.parse(fileText);
    this.encryptionService.decryptMessage(encryptedData);

    return { success: true };
  }

  @IpcHandle('set-config')
  async setConfig(@Payload(new ValidationPipe()) payload: SetConfigPayloadDto): Promise<{ success: boolean }> {
    const hashedPassword: string = this.encryptionService.hashText(payload.password, this.settingsService.salt);
    this.encryptionService.setEncryptionKey(hashedPassword);

    const encryptionResult: EncryptResponse = this.encryptionService.encryptMessage({
      message: JSON.stringify({
        mongodbURI: payload.databaseUrl,
      }),
    });

    this.settingsService.saveSetting({ fileName: SettingFile.GENERAL, data: JSON.stringify(encryptionResult) });

    return {
      success: true,
    };
  }

  @IpcHandle('state/set-item')
  async setStateItem(@Payload(new ValidationPipe()) payload: SetStatePayloadDto): Promise<void> {
    if (!this.encryptionService.isEncryptionKeyAvailable()) {
      return;
    }

    let data: string;
    if (!!payload.encrypt) {
      const encrypted: EncryptResponse = this.encryptionService.encryptMessage({ message: payload.data });
      data = JSON.stringify(encrypted);
    } else {
      data = payload.data;
    }

    this.settingsService.saveSetting({ fileName: payload.key, folder: SettingFolder.STATE, data });
    this.logger.debug(`State item "${payload.key}" saved`);
  }

  @IpcHandle('state/get-item')
  async getStateItem(
    @Payload(new ValidationPipe()) payload: GetStatePayloadDto
  ): Promise<{ state: string | undefined }> {
    try {
      let state: string;
      const response: string = this.settingsService.readSetting({
        fileName: payload.key,
        folder: SettingFolder.STATE,
      });

      if (payload.encrypt) {
        const encrypted: EncryptResponse = JSON.parse(response);
        state = this.encryptionService.decryptMessage(encrypted);
      } else {
        state = response;
      }

      return { state };
    } catch (e) {
      this.logger.debug(e);
      this.logger.debug(`State item "${payload.key}" doesn't exist`);
      return { state: undefined };
    }
  }

  @IpcHandle('state/remove-item')
  async removeStateItem(@Payload(new ValidationPipe()) payload: RemoveStatePayloadDto): Promise<void> {
    this.settingsService.removeSetting({ fileName: payload.key, folder: SettingFolder.STATE });
  }
}
