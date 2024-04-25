/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./apps/main/src/core/services/app-menu/app-menu.service.ts":
/*!******************************************************************!*\
  !*** ./apps/main/src/core/services/app-menu/app-menu.service.ts ***!
  \******************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppMenuService = void 0;
const nest_electron_1 = __webpack_require__(/*! @doubleshot/nest-electron */ "@doubleshot/nest-electron");
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const electron_1 = __webpack_require__(/*! electron */ "electron");
let AppMenuService = class AppMenuService {
    constructor(win) {
        this.win = win;
    }
    createMainMenu() {
        const isMac = process.platform === 'darwin';
        const template = [
            ...(isMac
                ? [
                    {
                        label: electron_1.app.name,
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
                label: 'Window',
                submenu: [
                    { role: 'minimize' },
                    { role: 'zoom' },
                    ...(isMac
                        ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
                        : [{ role: 'close' }]),
                ],
            },
            {
                role: 'help',
                submenu: [
                    {
                        label: 'Learn More',
                        click: async () => {
                            await electron_1.shell.openExternal('https://electronjs.org');
                        },
                    },
                ],
            },
        ];
        const menu = electron_1.Menu.buildFromTemplate(template);
        electron_1.Menu.setApplicationMenu(menu);
    }
};
exports.AppMenuService = AppMenuService;
exports.AppMenuService = AppMenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nest_electron_1.Window)()),
    __metadata("design:paramtypes", [typeof (_a = typeof electron_1.BrowserWindow !== "undefined" && electron_1.BrowserWindow) === "function" ? _a : Object])
], AppMenuService);


/***/ }),

/***/ "./apps/main/src/main.module.ts":
/*!**************************************!*\
  !*** ./apps/main/src/main.module.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MainModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const nest_electron_1 = __webpack_require__(/*! @doubleshot/nest-electron */ "@doubleshot/nest-electron");
const electron_1 = __webpack_require__(/*! electron */ "electron");
const node_path_1 = __webpack_require__(/*! node:path */ "node:path");
const settings_module_1 = __webpack_require__(/*! ./modules/settings/settings.module */ "./apps/main/src/modules/settings/settings.module.ts");
const app_menu_service_1 = __webpack_require__(/*! ./core/services/app-menu/app-menu.service */ "./apps/main/src/core/services/app-menu/app-menu.service.ts");
let MainModule = class MainModule {
};
exports.MainModule = MainModule;
exports.MainModule = MainModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nest_electron_1.ElectronModule.registerAsync({
                useFactory: async () => {
                    const win = new electron_1.BrowserWindow({
                        minWidth: 1200,
                        width: 1200,
                        minHeight: 800,
                        height: 800,
                        webPreferences: {
                            preload: (0, node_path_1.resolve)(__dirname, '../preload/preload.js'),
                        },
                    });
                    win.loadURL('http://localhost:4200');
                    return win;
                },
            }),
            settings_module_1.SettingsModule,
        ],
        controllers: [],
        providers: [app_menu_service_1.AppMenuService],
    })
], MainModule);


/***/ }),

/***/ "./apps/main/src/modules/settings/controllers/dtos/set-config.dto.ts":
/*!***************************************************************************!*\
  !*** ./apps/main/src/modules/settings/controllers/dtos/set-config.dto.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SetConfigPayloadDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
class SetConfigPayloadDto {
}
exports.SetConfigPayloadDto = SetConfigPayloadDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetConfigPayloadDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetConfigPayloadDto.prototype, "databaseUrl", void 0);


/***/ }),

/***/ "./apps/main/src/modules/settings/controllers/dtos/set-state.dto.ts":
/*!**************************************************************************!*\
  !*** ./apps/main/src/modules/settings/controllers/dtos/set-state.dto.ts ***!
  \**************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RemoveStatePayloadDto = exports.GetStatePayloadDto = exports.SetStatePayloadDto = void 0;
const class_validator_1 = __webpack_require__(/*! class-validator */ "class-validator");
const settings_service_1 = __webpack_require__(/*! ../../services/settings.service */ "./apps/main/src/modules/settings/services/settings.service.ts");
class SetStatePayloadDto {
}
exports.SetStatePayloadDto = SetStatePayloadDto;
__decorate([
    (0, class_validator_1.IsEnum)(settings_service_1.SettingFile),
    __metadata("design:type", typeof (_a = typeof settings_service_1.SettingFile !== "undefined" && settings_service_1.SettingFile) === "function" ? _a : Object)
], SetStatePayloadDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsJSON)(),
    __metadata("design:type", String)
], SetStatePayloadDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetStatePayloadDto.prototype, "encrypt", void 0);
class GetStatePayloadDto {
}
exports.GetStatePayloadDto = GetStatePayloadDto;
__decorate([
    (0, class_validator_1.IsEnum)(settings_service_1.SettingFile),
    __metadata("design:type", typeof (_b = typeof settings_service_1.SettingFile !== "undefined" && settings_service_1.SettingFile) === "function" ? _b : Object)
], GetStatePayloadDto.prototype, "key", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], GetStatePayloadDto.prototype, "encrypt", void 0);
class RemoveStatePayloadDto {
}
exports.RemoveStatePayloadDto = RemoveStatePayloadDto;
__decorate([
    (0, class_validator_1.IsEnum)(settings_service_1.SettingFile),
    __metadata("design:type", typeof (_c = typeof settings_service_1.SettingFile !== "undefined" && settings_service_1.SettingFile) === "function" ? _c : Object)
], RemoveStatePayloadDto.prototype, "key", void 0);


/***/ }),

/***/ "./apps/main/src/modules/settings/controllers/settings.controller.ts":
/*!***************************************************************************!*\
  !*** ./apps/main/src/modules/settings/controllers/settings.controller.ts ***!
  \***************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SettingsController_1;
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsController = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const microservices_1 = __webpack_require__(/*! @nestjs/microservices */ "@nestjs/microservices");
const nest_electron_1 = __webpack_require__(/*! @doubleshot/nest-electron */ "@doubleshot/nest-electron");
const encryption_1 = __webpack_require__(/*! ~library/encryption */ "./libs/encryption/src/index.ts");
const settings_service_1 = __webpack_require__(/*! ../services/settings.service */ "./apps/main/src/modules/settings/services/settings.service.ts");
const set_config_dto_1 = __webpack_require__(/*! ./dtos/set-config.dto */ "./apps/main/src/modules/settings/controllers/dtos/set-config.dto.ts");
const set_state_dto_1 = __webpack_require__(/*! ./dtos/set-state.dto */ "./apps/main/src/modules/settings/controllers/dtos/set-state.dto.ts");
let SettingsController = SettingsController_1 = class SettingsController {
    constructor(encryptionService, settingsService) {
        this.encryptionService = encryptionService;
        this.settingsService = settingsService;
        this.logger = new common_1.Logger(SettingsController_1.name);
    }
    onModuleInit() {
        this.settingsService.confirmAndCreateFolder();
    }
    async setPassword(password) {
        if (!password) {
            new common_1.BadRequestException(['Password is mandatory']);
        }
        const hashedPassword = this.encryptionService.hashText(password, this.settingsService.salt);
        this.encryptionService.setEncryptionKey(hashedPassword);
        const fileText = this.settingsService.readSetting({ fileName: settings_service_1.SettingFile.GENERAL });
        const encryptedData = JSON.parse(fileText);
        this.encryptionService.decryptMessage(encryptedData);
        return { success: true };
    }
    async setConfig(payload) {
        const hashedPassword = this.encryptionService.hashText(payload.password, this.settingsService.salt);
        this.encryptionService.setEncryptionKey(hashedPassword);
        const encryptionResult = this.encryptionService.encryptMessage({
            message: JSON.stringify({
                mongodbURI: payload.databaseUrl,
            }),
        });
        this.settingsService.saveSetting({ fileName: settings_service_1.SettingFile.GENERAL, data: JSON.stringify(encryptionResult) });
        return {
            success: true,
        };
    }
    async setStateItem(payload) {
        if (!this.encryptionService.isEncryptionKeyAvailable()) {
            return;
        }
        let data;
        if (!!payload.encrypt) {
            const encrypted = this.encryptionService.encryptMessage({ message: payload.data });
            data = JSON.stringify(encrypted);
        }
        else {
            data = payload.data;
        }
        this.settingsService.saveSetting({ fileName: payload.key, folder: settings_service_1.SettingFolder.STATE, data });
        this.logger.debug(`State item "${payload.key}" saved`);
    }
    async getStateItem(payload) {
        try {
            let state;
            const response = this.settingsService.readSetting({
                fileName: payload.key,
                folder: settings_service_1.SettingFolder.STATE,
            });
            if (payload.encrypt) {
                const encrypted = JSON.parse(response);
                state = this.encryptionService.decryptMessage(encrypted);
            }
            else {
                state = response;
            }
            return { state };
        }
        catch (e) {
            this.logger.debug(e);
            this.logger.debug(`State item "${payload.key}" doesn't exist`);
            return { state: undefined };
        }
    }
    async removeStateItem(payload) {
        this.settingsService.removeSetting({ fileName: payload.key, folder: settings_service_1.SettingFolder.STATE });
    }
};
exports.SettingsController = SettingsController;
__decorate([
    (0, nest_electron_1.IpcHandle)('set-password'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", typeof (_c = typeof Promise !== "undefined" && Promise) === "function" ? _c : Object)
], SettingsController.prototype, "setPassword", null);
__decorate([
    (0, nest_electron_1.IpcHandle)('set-config'),
    __param(0, (0, microservices_1.Payload)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_d = typeof set_config_dto_1.SetConfigPayloadDto !== "undefined" && set_config_dto_1.SetConfigPayloadDto) === "function" ? _d : Object]),
    __metadata("design:returntype", typeof (_e = typeof Promise !== "undefined" && Promise) === "function" ? _e : Object)
], SettingsController.prototype, "setConfig", null);
__decorate([
    (0, nest_electron_1.IpcHandle)('state/set-item'),
    __param(0, (0, microservices_1.Payload)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_f = typeof set_state_dto_1.SetStatePayloadDto !== "undefined" && set_state_dto_1.SetStatePayloadDto) === "function" ? _f : Object]),
    __metadata("design:returntype", typeof (_g = typeof Promise !== "undefined" && Promise) === "function" ? _g : Object)
], SettingsController.prototype, "setStateItem", null);
__decorate([
    (0, nest_electron_1.IpcHandle)('state/get-item'),
    __param(0, (0, microservices_1.Payload)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_h = typeof set_state_dto_1.GetStatePayloadDto !== "undefined" && set_state_dto_1.GetStatePayloadDto) === "function" ? _h : Object]),
    __metadata("design:returntype", typeof (_j = typeof Promise !== "undefined" && Promise) === "function" ? _j : Object)
], SettingsController.prototype, "getStateItem", null);
__decorate([
    (0, nest_electron_1.IpcHandle)('state/remove-item'),
    __param(0, (0, microservices_1.Payload)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_k = typeof set_state_dto_1.RemoveStatePayloadDto !== "undefined" && set_state_dto_1.RemoveStatePayloadDto) === "function" ? _k : Object]),
    __metadata("design:returntype", typeof (_l = typeof Promise !== "undefined" && Promise) === "function" ? _l : Object)
], SettingsController.prototype, "removeStateItem", null);
exports.SettingsController = SettingsController = SettingsController_1 = __decorate([
    (0, common_1.Controller)('settings'),
    __metadata("design:paramtypes", [typeof (_a = typeof encryption_1.EncryptionService !== "undefined" && encryption_1.EncryptionService) === "function" ? _a : Object, typeof (_b = typeof settings_service_1.SettingsService !== "undefined" && settings_service_1.SettingsService) === "function" ? _b : Object])
], SettingsController);


/***/ }),

/***/ "./apps/main/src/modules/settings/services/settings.service.ts":
/*!*********************************************************************!*\
  !*** ./apps/main/src/modules/settings/services/settings.service.ts ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SettingsService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingFolder = exports.SettingFile = exports.SettingsService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const node_path_1 = __webpack_require__(/*! node:path */ "node:path");
const node_os_1 = __webpack_require__(/*! node:os */ "node:os");
const node_fs_1 = __webpack_require__(/*! node:fs */ "node:fs");
const node_crypto_1 = __webpack_require__(/*! node:crypto */ "node:crypto");
let SettingsService = SettingsService_1 = class SettingsService {
    constructor() {
        this.logger = new common_1.Logger(SettingsService_1.name);
        this.folderPath = (0, node_path_1.resolve)((0, node_os_1.homedir)(), '.SorobanHub');
        this.saltFilePath = (0, node_path_1.resolve)(this.folderPath, 'salt.txt');
        if ((0, node_fs_1.existsSync)(this.saltFilePath)) {
            this.salt = (0, node_fs_1.readFileSync)(this.saltFilePath, 'utf-8');
        }
        else {
            this.logger.debug("Salt doesn't exist, salt just created");
            const newSalt = (0, node_crypto_1.randomBytes)(256).toString('hex');
            (0, node_fs_1.writeFileSync)(this.saltFilePath, newSalt, 'utf-8');
            this.salt = newSalt;
        }
    }
    confirmAndCreateFolder() {
        if (!(0, node_fs_1.existsSync)(this.folderPath)) {
            this.logger.debug("Settings folder doesn't exist, folder created.");
            (0, node_fs_1.mkdirSync)(this.folderPath, { recursive: true });
        }
    }
    saveSetting(params) {
        const targetFolder = (0, node_path_1.resolve)(this.folderPath, params.folder || '');
        if (!(0, node_fs_1.existsSync)(targetFolder)) {
            (0, node_fs_1.mkdirSync)(targetFolder, { recursive: true });
        }
        const filePath = (0, node_path_1.resolve)(targetFolder, `${params.fileName}.json`);
        (0, node_fs_1.writeFileSync)(filePath, params.data, 'utf-8');
    }
    readSetting(params) {
        const filePath = (0, node_path_1.resolve)(this.folderPath, params.folder || '', `${params.fileName}.json`);
        return (0, node_fs_1.readFileSync)(filePath, 'utf-8');
    }
    removeSetting(params) {
        const filePath = (0, node_path_1.resolve)(this.folderPath, params.folder || '', `${params.fileName}.json`);
        (0, node_fs_1.unlinkSync)(filePath);
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SettingsService);
var SettingFile;
(function (SettingFile) {
    SettingFile["GENERAL"] = "general";
    SettingFile["ONBOARDING"] = "onboarding";
    SettingFile["NETWORKS"] = "networks";
    SettingFile["IDENTITIES"] = "identities";
    SettingFile["PROJECTS"] = "projects";
    SettingFile["WIDGETS"] = "widgets";
})(SettingFile || (exports.SettingFile = SettingFile = {}));
var SettingFolder;
(function (SettingFolder) {
    SettingFolder["STATE"] = "state";
})(SettingFolder || (exports.SettingFolder = SettingFolder = {}));


/***/ }),

/***/ "./apps/main/src/modules/settings/settings.module.ts":
/*!***********************************************************!*\
  !*** ./apps/main/src/modules/settings/settings.module.ts ***!
  \***********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SettingsModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const settings_controller_1 = __webpack_require__(/*! ./controllers/settings.controller */ "./apps/main/src/modules/settings/controllers/settings.controller.ts");
const encryption_1 = __webpack_require__(/*! ~library/encryption */ "./libs/encryption/src/index.ts");
const settings_service_1 = __webpack_require__(/*! ./services/settings.service */ "./apps/main/src/modules/settings/services/settings.service.ts");
let SettingsModule = class SettingsModule {
};
exports.SettingsModule = SettingsModule;
exports.SettingsModule = SettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [encryption_1.EncryptionModule],
        controllers: [settings_controller_1.SettingsController],
        providers: [settings_service_1.SettingsService],
    })
], SettingsModule);


/***/ }),

/***/ "./libs/encryption/src/encryption.module.ts":
/*!**************************************************!*\
  !*** ./libs/encryption/src/encryption.module.ts ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EncryptionModule = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const encryption_service_1 = __webpack_require__(/*! ./encryption.service */ "./libs/encryption/src/encryption.service.ts");
let EncryptionModule = class EncryptionModule {
};
exports.EncryptionModule = EncryptionModule;
exports.EncryptionModule = EncryptionModule = __decorate([
    (0, common_1.Module)({
        providers: [encryption_service_1.EncryptionService],
        exports: [encryption_service_1.EncryptionService],
    })
], EncryptionModule);


/***/ }),

/***/ "./libs/encryption/src/encryption.service.ts":
/*!***************************************************!*\
  !*** ./libs/encryption/src/encryption.service.ts ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EncryptionService_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EncryptionService = void 0;
const common_1 = __webpack_require__(/*! @nestjs/common */ "@nestjs/common");
const node_crypto_1 = __webpack_require__(/*! node:crypto */ "node:crypto");
let EncryptionService = EncryptionService_1 = class EncryptionService {
    constructor() {
        this.logger = new common_1.Logger(EncryptionService_1.name);
        this.ALGO = 'aes-256-cbc';
        let key;
        this.isEncryptionKeyAvailable = () => !!key;
        this.setEncryptionKey = (value) => {
            this.logger.debug(`Saved key: ${value}`);
            key = value;
        };
        this.encryptMessage = (params) => {
            if (!key) {
                throw new Error('Encryption key has not been set');
            }
            const iv = (0, node_crypto_1.randomBytes)(16);
            const cipher = (0, node_crypto_1.createCipheriv)(this.ALGO, Buffer.from(key, 'base64'), iv);
            let encrypted = cipher.update(params.message);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return { encrypted: encrypted.toString('base64'), iv: iv.toString('base64') };
        };
        this.decryptMessage = (params) => {
            if (!key) {
                throw new Error('Encryption key has not been set');
            }
            const decipher = (0, node_crypto_1.createDecipheriv)(this.ALGO, Buffer.from(key, 'base64'), Buffer.from(params.iv, 'base64'));
            const decrypted = decipher.update(Buffer.from(params.encrypted, 'base64'));
            return Buffer.concat([decrypted, decipher.final()]).toString('utf-8');
        };
    }
    hashText(text, salt) {
        return (0, node_crypto_1.scryptSync)(text, salt, 32).toString('base64');
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = EncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EncryptionService);


/***/ }),

/***/ "./libs/encryption/src/index.ts":
/*!**************************************!*\
  !*** ./libs/encryption/src/index.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./encryption.module */ "./libs/encryption/src/encryption.module.ts"), exports);
__exportStar(__webpack_require__(/*! ./encryption.service */ "./libs/encryption/src/encryption.service.ts"), exports);


/***/ }),

/***/ "@doubleshot/nest-electron":
/*!********************************************!*\
  !*** external "@doubleshot/nest-electron" ***!
  \********************************************/
/***/ ((module) => {

module.exports = require("@doubleshot/nest-electron");

/***/ }),

/***/ "@nestjs/common":
/*!*********************************!*\
  !*** external "@nestjs/common" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),

/***/ "@nestjs/core":
/*!*******************************!*\
  !*** external "@nestjs/core" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),

/***/ "@nestjs/microservices":
/*!****************************************!*\
  !*** external "@nestjs/microservices" ***!
  \****************************************/
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),

/***/ "class-validator":
/*!**********************************!*\
  !*** external "class-validator" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("electron");

/***/ }),

/***/ "electron-squirrel-startup":
/*!********************************************!*\
  !*** external "electron-squirrel-startup" ***!
  \********************************************/
/***/ ((module) => {

module.exports = require("electron-squirrel-startup");

/***/ }),

/***/ "node:crypto":
/*!******************************!*\
  !*** external "node:crypto" ***!
  \******************************/
/***/ ((module) => {

module.exports = require("node:crypto");

/***/ }),

/***/ "node:fs":
/*!**************************!*\
  !*** external "node:fs" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:fs");

/***/ }),

/***/ "node:os":
/*!**************************!*\
  !*** external "node:os" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("node:os");

/***/ }),

/***/ "node:path":
/*!****************************!*\
  !*** external "node:path" ***!
  \****************************/
/***/ ((module) => {

module.exports = require("node:path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!*******************************!*\
  !*** ./apps/main/src/main.ts ***!
  \*******************************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(/*! @nestjs/core */ "@nestjs/core");
const electron_1 = __webpack_require__(/*! electron */ "electron");
const nest_electron_1 = __webpack_require__(/*! @doubleshot/nest-electron */ "@doubleshot/nest-electron");
const main_module_1 = __webpack_require__(/*! ./main.module */ "./apps/main/src/main.module.ts");
const app_menu_service_1 = __webpack_require__(/*! ./core/services/app-menu/app-menu.service */ "./apps/main/src/core/services/app-menu/app-menu.service.ts");
if (__webpack_require__(/*! electron-squirrel-startup */ "electron-squirrel-startup")) {
    electron_1.app.quit();
}
async function bootstrap() {
    try {
        await electron_1.app.whenReady();
        const nestApp = await core_1.NestFactory.createMicroservice(main_module_1.MainModule, {
            strategy: new nest_electron_1.ElectronIpcTransport(),
        });
        const appMenuService = nestApp.get(app_menu_service_1.AppMenuService);
        appMenuService.createMainMenu();
        await nestApp.listen();
        electron_1.app.on('window-all-closed', () => {
            nestApp.close();
            electron_1.app.quit();
        });
    }
    catch (error) {
        electron_1.app.quit();
    }
}
bootstrap();

})();

/******/ })()
;