import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { app } from 'electron';
import { ElectronIpcTransport } from '@doubleshot/nest-electron';
import { MainModule } from './main.module';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

async function bootstrap() {
  try {
    await app.whenReady();

    const nestApp = await NestFactory.createMicroservice<MicroserviceOptions>(MainModule, {
      strategy: new ElectronIpcTransport(),
    });

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
