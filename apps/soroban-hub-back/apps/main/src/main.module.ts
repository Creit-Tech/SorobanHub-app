import { Module } from '@nestjs/common';
import { ElectronModule } from '@doubleshot/nest-electron';
import { BrowserWindow } from 'electron';
import { resolve } from 'node:path';
import { SettingsModule } from './modules/settings/settings.module';
import { AppMenuService } from './core/services/app-menu/app-menu.service';

@Module({
  imports: [
    ElectronModule.registerAsync({
      isGlobal: true,
      useFactory: async (): Promise<BrowserWindow> => {
        const win: BrowserWindow = new BrowserWindow({
          minWidth: 1200,
          width: 1200,
          minHeight: 800,
          height: 800,
          webPreferences: {
            preload: resolve(__dirname, '../preload/preload.js'),
          },
        });

        win.loadFile(resolve(__dirname, '../renderer/index.html'));

        return win;
      },
    }),
    SettingsModule,
  ],
  controllers: [],
  providers: [AppMenuService],
})
export class MainModule {}
