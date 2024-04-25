import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { app } from 'electron';
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
