import { IsBoolean, IsEnum, IsJSON, IsOptional, IsString } from 'class-validator';
import { SettingFile } from '../../services/settings.service';

export class SetStatePayloadDto {
  @IsEnum(SettingFile)
  key: SettingFile;

  @IsString()
  @IsJSON()
  data: string;

  @IsOptional()
  @IsBoolean()
  encrypt?: boolean;
}

export class GetStatePayloadDto {
  @IsEnum(SettingFile)
  key: SettingFile;

  @IsOptional()
  @IsBoolean()
  encrypt?: boolean;
}

export class RemoveStatePayloadDto {
  @IsEnum(SettingFile)
  key: SettingFile;
}
