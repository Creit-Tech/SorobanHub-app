import { createStore, withProps } from '@ngneat/elf';
import { withEntities, selectAllEntities, deleteEntities } from '@ngneat/elf-entities';
import { Injectable } from '@angular/core';
import { Project, ProjectView } from '../projects/projects.repository';
import { LockScreenRepository } from '../lock-screen/lock-screen.repository';
import { filter, Observable, take } from 'rxjs';
import { persistState } from '@ngneat/elf-persist-state';
import { StorageStrategy } from '../storage.strategy';

export enum WidgetType {
  LEDGER_KEY_EXPIRATION = 'LEDGER_KEY_EXPIRATION',
  LEDGER_KEY_WATCHER = 'LEDGER_KEY_WATCHER',
  FUNCTION_CALL = 'FUNCTION_CALL',
  EVENTS_TRACKER = 'EVENTS_TRACKER',
  INSTALL_WASM = 'INSTALL_WASM',
  DEPLOY_SAC = 'DEPLOY_SAC',
  DEPLOY_CONTRACT = 'DEPLOY_CONTRACT',
}

export interface WidgetBase {
  _id: string;
  project: Project['_id'];
  projectView: ProjectView['_id'];
  name: string;
  type: WidgetType;
}

export interface LedgerKeyExpirationWidget extends WidgetBase {
  key: string;
  liveUntilLedgerSeq?: number;
  lastModifiedLedgerSeq?: number;
  type: WidgetType.LEDGER_KEY_EXPIRATION;
}

export enum FunctionCallParameterType {
  boolean = 'boolean',
  string = 'string',
  symbol = 'symbol',
  address = 'address',
  hash = 'hash',
  vec = 'vec',
  map = 'map',
  mapEntry = 'mapEntry',
  i256 = 'i256',
  u256 = 'u256',
  i128 = 'i128',
  u128 = 'u128',
  i64 = 'i64',
  u64 = 'u64',
  i32 = 'i32',
  u32 = 'u32',
}

export interface FunctionCallWidgetParameter {
  name: string;
  type: FunctionCallParameterType;
  children: FunctionCallWidget['parameters'];
}

export interface FunctionCallWidget extends WidgetBase {
  fnName: string;
  source?: string;
  contractId: string;
  type: WidgetType.FUNCTION_CALL;
  parameters: FunctionCallWidgetParameter[];
}

export interface InstallWASMWidget extends WidgetBase {
  source?: string;
  type: WidgetType.INSTALL_WASM;
  pathToFile: string;
}

export interface DeploySACWidget extends WidgetBase {
  source?: string;
  type: WidgetType.DEPLOY_SAC;
  code: string;
  issuer: string;
}

export interface DeployContractWidget extends WidgetBase {
  source?: string;
  type: WidgetType.DEPLOY_CONTRACT;
  pathToFile: string;
}

export type Widget =
  | LedgerKeyExpirationWidget
  | FunctionCallWidget
  | InstallWASMWidget
  | DeploySACWidget
  | DeployContractWidget;

export interface WidgetsProps {}

const store = createStore(
  { name: 'widgets' },
  withProps<WidgetsProps>({}),
  withEntities<Widget, '_id'>({ idKey: '_id' })
);

@Injectable({ providedIn: 'root' })
export class WidgetsRepository {
  store = store;
  persist?: {
    initialized$: Observable<boolean>;
    unsubscribe(): void;
  };

  widgets$ = store.pipe(selectAllEntities());

  constructor(private readonly lockScreenRepository: LockScreenRepository) {
    this.lockScreenRepository.isUnLocked$.pipe(filter(Boolean), take(1)).subscribe(() => {
      this.persist = persistState(store, {
        key: 'widgets',
        storage: new StorageStrategy({ encrypt: true }),
      });
    });
  }

  deleteWidget(widgetId: Widget['_id']) {
    this.store.update(deleteEntities([widgetId]));
  }
}
