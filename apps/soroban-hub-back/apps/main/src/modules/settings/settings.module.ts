import { Module } from '@nestjs/common';
import { SettingsController } from './controllers/settings.controller';
import { EncryptionModule } from '~library/encryption';
import { SettingsService } from './services/settings.service';

@Module({
  imports: [EncryptionModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
