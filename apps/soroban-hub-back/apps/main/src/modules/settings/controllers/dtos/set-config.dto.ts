import { IsString } from 'class-validator';

export class SetConfigPayloadDto {
  @IsString()
  password: string;

  @IsString()
  databaseUrl: string;
}
