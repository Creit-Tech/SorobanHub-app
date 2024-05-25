import { Controller } from '@nestjs/common';
import { IpcHandle } from '@doubleshot/nest-electron';
import { dialog, OpenDialogReturnValue } from 'electron';

@Controller('utils/dialogs')
export class DialogsController {
  @IpcHandle('file-path')
  async filePath(): Promise<{ success: true; path: string } | { success: false; message: string }> {
    const result: OpenDialogReturnValue = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Contracts', extensions: ['wasm'] }],
    });

    if (result.canceled) {
      return {
        success: false,
        message: 'User cancelled the selection',
      };
    }

    return {
      success: true,
      path: result.filePaths[0],
    };
  }
}
