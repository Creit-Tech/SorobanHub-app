import { Module } from '@nestjs/common';
import { DialogsController } from './controllers/dialogs/dialogs.controller';
import { ChecksumsController } from './controllers/checksums/checksums.controller';
import { FilesController } from './controllers/files/files.controller';

@Module({
  controllers: [DialogsController, ChecksumsController, FilesController],
})
export class UtilsModule {}
