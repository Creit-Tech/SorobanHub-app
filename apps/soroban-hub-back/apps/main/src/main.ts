import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { app, globalShortcut } from 'electron';
import { ElectronIpcTransport } from '@doubleshot/nest-electron';
import { MainModule } from './main.module';
import { INestMicroservice } from '@nestjs/common';
import { AppMenuService } from './core/services/app-menu/app-menu.service';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

async function bootstrap() {
  try {
    await app.whenReady();

    const nestApp: INestMicroservice = await NestFactory.createMicroservice<MicroserviceOptions>(MainModule, {
      strategy: new ElectronIpcTransport(),
    });

    const appMenuService: AppMenuService = nestApp.get<AppMenuService>(AppMenuService);
    appMenuService.createMainMenu();

    await nestApp.listen();

    // Prevent user from reloading app (this way we prevent saving corrupted data if is the case we reload the app in the middle of an update)
    app.on('browser-window-focus', function () {
      globalShortcut.register('CommandOrControl+R', () => {
        console.log('CommandOrControl+R is pressed: Shortcut Disabled');
      });
      globalShortcut.register('CommandOrControl+Shift+R', () => {
        console.log('CommandOrControl+Shift+R is pressed: Shortcut Disabled');
      });
      globalShortcut.register('F5', () => {
        console.log('F5 is pressed: Shortcut Disabled');
      });
    });

    app.on('browser-window-blur', function () {
      globalShortcut.unregister('CommandOrControl+R');
      globalShortcut.unregister('CommandOrControl+Shift+R');
      globalShortcut.unregister('F5');
    });

    // Quit when all windows are closed (Mac included)
    app.on('window-all-closed', () => {
      // if (process.platform !== 'darwin') {
      nestApp.close();
      app.quit();
      // }
    });
  } catch (error) {
    app.quit();
  }
}

bootstrap();
