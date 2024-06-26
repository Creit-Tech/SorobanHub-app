import { Window } from '@doubleshot/nest-electron';
import { Injectable } from '@nestjs/common';
import { shell, Menu, app, BrowserWindow, MenuItemConstructorOptions } from 'electron';

@Injectable()
export class AppMenuService {
  constructor(@Window() private readonly win: BrowserWindow) {}

  createMainMenu() {
    const isMac: boolean = process.platform === 'darwin';

    const template = [
      ...(isMac
        ? [
            {
              label: app.name,
              submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' },
              ],
            },
          ]
        : []),
      {
        label: 'Projects',
        submenu: [
          {
            label: 'New Project',
            click: () => {
              this.win.webContents.send('menu-event', { type: 'newProject' });
            },
          },
          {
            label: 'Edit active project',
            click: () => {
              this.win.webContents.send('menu-event', { type: 'editActiveProject' });
            },
          },
          {
            label: 'Remove active project',
            click: () => {
              this.win.webContents.send('menu-event', { type: 'removeActiveProject' });
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          ...(isMac
            ? [
                { role: 'pasteAndMatchStyle' },
                { role: 'delete' },
                { role: 'selectAll' },
                { type: 'separator' },
                {
                  label: 'Speech',
                  submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }],
                },
              ]
            : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }]),
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        role: 'help',
        submenu: [
          {
            label: 'Learn More',
            click: async () => {
              await shell.openExternal('https://electronjs.org');
            },
          },
        ],
      },
    ];

    const menu: Menu = Menu.buildFromTemplate(template as any);
    Menu.setApplicationMenu(menu);
  }
}
